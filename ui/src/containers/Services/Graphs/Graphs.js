import React from 'react';
import { matchPath } from 'react-router-dom';
import echarts from 'echarts/lib/echarts';
import formatBytes from 'filesize';

import Title from '../../../components/Title/Title';
import { call } from '../../../utils';

import styles from './Graphs.module.css';

export default class Graphs extends React.Component {

  $cpuGraph = null;

  $memoryGraph = null;

  $speedGraph = null;

  $connectionsGraph = null;

  $trafficGraph = null;

  state = {
    loading: false,
    cpu_metrics: null,
    memory_metrics: null,
    speed_metrics: null,
    connections_metrics: null,
    traffic_metrics: null,
  };

  componentDidMount() {
    this.timer = window.setInterval(this.onRefresh, 5e3);
    this.onRefresh();
  }

  componentWillUnmount() {
    window.clearInterval(this.timer);
  }

  onRefresh = async () => {
    if (this.state.loading) {
      return;
    }
    const { params: { id } } = matchPath(this.props.match.url, { path: '/services/:id' });
    try {
      this.setState({ loading: true });
      const metrics = await call('get_service_metrics', { id });
      this.setState(metrics, () => {
        const { cpu_metrics, memory_metrics, speed_metrics, connections_metrics, traffic_metrics } = this.state;
        this.drawCpuUsageGraph(cpu_metrics);
        this.drawMemoryUsageGraph(memory_metrics);
        this.drawNetworkSpeed(speed_metrics);
        this.drawNetworkConnectionsGraph(connections_metrics);
        this.drawTrafficGraph(traffic_metrics);
      });
    } catch (err) {
      console.error(err);
    }
    window.setTimeout(() => this.setState({ loading: false }), 2e3);
  };

  drawCpuUsageGraph(dataset) {
    if (!dataset || dataset.length < 1) {
      return;
    }
    const chart = echarts.init(this.$cpuGraph);
    chart.setOption({
      grid: {
        top: 20,
        bottom: 30,
        left: 50,
        right: 20,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const { axisValue, seriesName, value } = params[0];
          return `Time: ${axisValue}<br/>${seriesName}: ${value}%`;
        },
      },
      xAxis: {
        data: dataset.map(([date]) => date),
        axisPointer: {
          snap: false,
        }
      },
      yAxis: {
        name: 'Percentage(%)',
        nameGap: 35,
        nameLocation: 'center',
        nameTextStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        min: 0,
        max: 100,
      },
      series: {
        name: 'Percentage',
        type: 'line',
        showSymbol: false,
        animationDuration: 500,
        lineStyle: {
          width: 1,
          color: '#dedede',
        },
        itemStyle: {
          color: '#dedede',
        },
        areaStyle: {
          color: '#dedede',
        },
        hoverAnimation: false,
        data: dataset.map(([_, v]) => v),
      },
    });
  }

  drawMemoryUsageGraph(dataset) {
    if (!dataset || dataset.length < 1) {
      return;
    }
    const chart = echarts.init(this.$memoryGraph);
    const formatValue = (value) => {
      const [num, unit] = formatBytes(value, { output: 'array' });
      return num.toFixed(2) + unit;
    };
    const dates = dataset.map(([date]) => date);
    const values = dataset.map(([_, v]) => v);
    chart.setOption({
      grid: {
        top: 20,
        bottom: 30,
        left: '15%',
        right: 20,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const { axisValue, seriesName, value } = params[0];
          return `Time: ${axisValue}<br/>${seriesName}: ${formatValue(value)}`;
        },
      },
      xAxis: {
        data: dates,
      },
      yAxis: {
        axisLabel: {
          formatter: formatValue,
        },
        max: Math.max(...values) * 1.66,
      },
      series: {
        name: 'Usage',
        type: 'line',
        showSymbol: false,
        animationDuration: 500,
        lineStyle: {
          width: 1,
          color: '#dedede',
        },
        itemStyle: {
          color: '#dedede',
        },
        areaStyle: {
          color: '#dedede',
        },
        hoverAnimation: false,
        data: values,
      },
    });
  }

  drawNetworkSpeed(datasets) {
    if (!datasets || datasets.length < 1) {
      return;
    }
    const chart = echarts.init(this.$speedGraph);
    const formatValue = (value) => {
      const [num, unit] = formatBytes(value, { output: 'array' });
      return num.toFixed(2) + unit + '/s';
    };
    chart.setOption({
      grid: {
        top: 20,
        bottom: 30,
        left: '15%',
        right: 20,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const markers = [
            '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#BFCCD6;"></span>',
            '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#202B33;"></span>',
          ];
          const builder = [
            `Time: ${params[0].axisValue}`,
            `${markers[0]} ${params[0].seriesName}: ${formatValue(params[0].value)}`,
            `${markers[1]} ${params[1].seriesName}: ${formatValue(params[1].value)}`,
          ];
          return builder.join('<br/>');
        },
      },
      xAxis: {
        data: datasets[0].map(([date]) => date),
      },
      yAxis: {
        axisLabel: {
          formatter: formatValue,
        },
      },
      series: datasets.map((dataset, i) => ({
        name: i < 1 ? 'Upload Speed' : 'Download Speed',
        type: 'line',
        showSymbol: false,
        animationDuration: 500,
        lineStyle: {
          width: 1,
          color: ['#BFCCD6', '#202B33'][i],
        },
        hoverAnimation: false,
        data: dataset.map(([_, v]) => v),
      })),
    });
  }

  drawNetworkConnectionsGraph(dataset) {
    if (!dataset || dataset.length < 1) {
      return;
    }
    const chart = echarts.init(this.$connectionsGraph);
    const dates = dataset.map(([date]) => date);
    const values = dataset.map(([_, v]) => v);
    chart.setOption({
      grid: {
        top: 20,
        bottom: 30,
        left: '10%',
        right: 20,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const { axisValue, seriesName, value } = params[0];
          return `Time: ${axisValue}<br/>${seriesName}: ${value}`;
        },
      },
      xAxis: {
        data: dates,
      },
      yAxis: {
        name: 'Connections',
        nameGap: 35,
        nameLocation: 'center',
        nameTextStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        min: 0,
        minInterval: 1,
      },
      series: {
        name: 'Connections',
        type: 'line',
        showSymbol: false,
        animationDuration: 500,
        lineStyle: {
          width: 1,
          color: '#8e8e8e',
        },
        itemStyle: {
          color: '#8e8e8e',
        },
        hoverAnimation: false,
        data: values,
      },
    });
  }

  drawTrafficGraph(datasets) {
    if (!datasets || datasets.length < 1) {
      return;
    }
    const chart = echarts.init(this.$trafficGraph);
    const formatValue = (value) => {
      const [num, unit] = formatBytes(value, { output: 'array' });
      return num.toFixed(2) + unit;
    };
    chart.setOption({
      grid: {
        top: 20,
        bottom: 30,
        left: '15%',
        right: 20,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const markers = [
            '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#BFCCD6;"></span>',
            '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#202B33;"></span>',
          ];
          const builder = [
            `Time: ${params[0].axisValue}`,
            `${markers[0]} ${params[0].seriesName}: ${formatValue(params[0].value)}`,
            `${markers[1]} ${params[1].seriesName}: ${formatValue(params[1].value)}`,
          ];
          return builder.join('<br/>');
        },
      },
      xAxis: {
        data: datasets[0].map(([date]) => date),
      },
      yAxis: {
        axisLabel: {
          formatter: formatValue,
        },
      },
      series: datasets.map((dataset, i) => ({
        name: i < 1 ? 'Total Upload' : 'Total Download',
        type: 'line',
        showSymbol: false,
        animationDuration: 500,
        lineStyle: {
          width: 1,
          color: ['#BFCCD6', '#202B33'][i],
        },
        // areaStyle: {
        //   color: ['#BFCCD6', '#202B33'][i],
        // },
        hoverAnimation: false,
        data: dataset.map(([_, v]) => v),
      })),
    });
  }

  renderGraph = (refStr, dataset) => {
    let component = null;
    if (dataset) {
      if (dataset.length < 1) {
        component = 'NO DATA';
      }
    } else {
      component = 'LOADING';
    }
    return <div className={styles.canvas} ref={(dom) => this[refStr] = dom}>{component}</div>;
  };

  render() {
    const { cpu_metrics, memory_metrics, speed_metrics, connections_metrics, traffic_metrics } = this.state;
    return (
      <div className={styles.container}>
        <Title>Graphs</Title>
        <div className={styles.graphs}>
          <section className={styles.graph}>
            <h3>CPU Utilization</h3>
            {this.renderGraph('$cpuGraph', cpu_metrics)}
          </section>
          <section className={styles.graph}>
            <h3>Memory Usage</h3>
            {this.renderGraph('$memoryGraph', memory_metrics)}
          </section>
        </div>
        <div className={styles.graphs}>
          <section className={styles.graph}>
            <h3>Network Speed</h3>
            {this.renderGraph('$speedGraph', speed_metrics)}
          </section>
          <section className={styles.graph}>
            <h3>Network Connections</h3>
            {this.renderGraph('$connectionsGraph', connections_metrics)}
          </section>
        </div>
        <div className={styles.graphs}>
          <section className={styles.graph}>
            <h3>Network Traffic</h3>
            {this.renderGraph('$trafficGraph', traffic_metrics)}
          </section>
        </div>
      </div>
    );
  }

}
