import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, Dialog, Intent, FormGroup, Icon, TagInput } from '@blueprintjs/core';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from './ProtocolStackEditor.module.css';

const PresetParam = (props) => {
  const {
    pkey, type, description, optional, values,
    value, onChange
  } = props;

  let component = null;
  const _onChange = (e) => onChange(pkey, e.target.value);

  switch (type) {
    case 'string':
      component = (
        <input
          className="pt-input pt-fill" type="text"
          value={value}
          placeholder={pkey}
          onChange={_onChange}
        />
      );
      break;
    case 'number':
      component = (
        <input
          className="pt-input pt-fill" type="number"
          value={value}
          placeholder={pkey}
          onChange={_onChange}
        />
      );
      break;
    case 'enum':
      component = (
        <div className="pt-select pt-fill">
          <select value={value} onChange={_onChange}>
            {values.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      );
      break;
    case 'array':
      component = (
        <TagInput
          leftIcon="multi-select"
          placeholder={pkey}
          values={value}
          onChange={(items) => onChange(pkey, items)}
        />
      );
      break;
    default:
      console.warn('unsupported preset parameter type:', type);
      return null;
  }
  return (
    <FormGroup label={pkey} helperText={description} requiredLabel={!optional}>
      {component}
    </FormGroup>
  );
};

export default class ProtocolStackEditor extends React.Component {

  static propTypes = {
    presets: PropTypes.array.isRequired,
    defs: PropTypes.object.isRequired,
    onAddPreset: PropTypes.func,
    onEditPreset: PropTypes.func,
    onCopyPreset: PropTypes.func,
    onRemovePreset: PropTypes.func,
    onSortPresets: PropTypes.func,
  };

  static defaultProps = {
    onAddPreset: (/* preset */) => {
    },
    onEditPreset: (/* presetIndex, newPreset */) => {
    },
    onCopyPreset: (/* presetIndex */) => {
    },
    onRemovePreset: (/* presetIndex */) => {
    },
    onSortPresets: (/* presets */) => {
    },
  };

  state = {
    isDialogOpen: false,
    isEditing: false,
    currentPresetIndex: -1,
    currentPreset: null, // a def
  };

  componentDidMount() {
    this.init();
  }

  init() {
    this.onSelectPreset({ target: { value: Object.keys(this.props.defs)[0] } });
  }

  onSelectPreset = (e) => {
    const { defs } = this.props;
    const name = e.target.value;
    const def = _.cloneDeep(defs[name]);
    for (const param of def.params) {
      param.value = param.defaultValue;
    }
    this.setState({ currentPreset: def });
  };

  onPresetParamChange = (key, value) => {
    const { currentPreset } = this.state;
    this.setState({
      currentPreset: {
        ...currentPreset,
        params: currentPreset.params.map((param) =>
          param.key === key ? ({ ...param, value }) : param
        ),
      },
    });
  };

  onConfirm = () => {
    const { isEditing, currentPresetIndex, currentPreset } = this.state;

    // create a new preset object
    const preset = {
      name: currentPreset.name,
      _def: currentPreset,
    };
    const params = {};
    for (const { key, value } of currentPreset.params) {
      params[key] = value;
    }
    if (Object.keys(params).length > 0) {
      preset.params = params;
    }

    // edit or add
    if (isEditing) {
      this.props.onEditPreset(currentPresetIndex, preset);
    } else {
      this.props.onAddPreset(preset);
    }
    this.setState({ isDialogOpen: false });
  };

  onAddPreset = () => {
    this.init();
    this.setState({ isDialogOpen: true, isEditing: false });
  };

  onEditPreset = (preset, i) => {
    const { defs } = this.props;
    const def = defs[preset.name];
    this.setState({
      isDialogOpen: true,
      isEditing: true,
      currentPresetIndex: i,
      currentPreset: {
        ...def,
        params: def.params.map((param) => ({
          ...param,
          value: preset.params[param.key],
        })),
      },
    });
  };

  onCopyPreset = (i) => {
    this.props.onCopyPreset(i);
  };

  onSortPresets = (result) => {
    if (!result.destination) {
      return;
    }
    // a little function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    const presets = reorder(this.props.presets, fromIndex, toIndex);
    this.props.onSortPresets(presets);
  };

  onRemovePreset = (i) => {
    this.props.onRemovePreset(i);
  };

  render() {
    const { presets, defs } = this.props;
    const { isEditing, currentPreset } = this.state;
    const addressingCount = presets.filter(({ _def }) => _def.isAddressing).length;
    return (
      <div className={styles.container}>
        {addressingCount < 1 && (
          <p className="pt-callout pt-intent-warning pt-icon-info-sign">
            <span>Require an <b>addressing</b> preset in the list.</span>
          </p>
        )}
        {addressingCount > 1 && (
          <p className="pt-callout pt-intent-danger pt-icon-info-sign">
            <span>Only <b>one</b> addressing preset is allowed in the list.</span>
          </p>
        )}
        {(_.uniqBy(presets, 'name').length < presets.length) && (
          <p className="pt-callout pt-icon-info-sign">
            <span>Duplicate presets found, are you sure to do this?</span>
          </p>
        )}
        <DragDropContext onDragEnd={this.onSortPresets}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                className={styles.presets}
                ref={provided.innerRef}
              >
                {presets.map((preset, i) => (
                  <Draggable
                    key={i}
                    draggableId={i + ''}
                    index={i}
                  >
                    {(provided, snapshot) => (
                      <div>
                        <div
                          className={styles.preset}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            ...(snapshot.isDragging ? {
                              backgroundColor: '#e0e0e0',
                            } : {})
                          }}
                        >
                          <div className={styles.content}>
                            {preset._def.isAddressing && <div className={styles.addressing}/>}
                            <div className={styles.dragger}>
                              <Icon icon="drag-handle-vertical"/>
                            </div>
                            <div>
                              <p>{preset.name}</p>
                              {preset.params && (<small>{JSON.stringify(preset.params)}</small>)}
                            </div>
                          </div>
                          <div className={styles.operations}>
                            <Icon
                              icon="annotation"
                              color="#5f5f5f"
                              iconSize="14"
                              onClick={() => this.onEditPreset(preset, i)}
                            />
                            <Icon
                              icon="duplicate"
                              color="#5f5f5f"
                              iconSize="14"
                              onClick={() => this.onCopyPreset(i)}
                            />
                            {presets.length > 1 && (
                              <Icon
                                icon="trash"
                                color="#5f5f5f"
                                iconSize="14"
                                onClick={() => this.onRemovePreset(i)}
                              />
                            )}
                          </div>
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Button text="Add Preset" icon="add" onClick={this.onAddPreset}/>
        {currentPreset && (
          <Dialog
            iconName="inbox"
            isOpen={this.state.isDialogOpen}
            onClose={() => this.setState({ isDialogOpen: false })}
            title={isEditing ? 'Edit Preset' : 'Add Preset'}
          >
            <div className="pt-dialog-body">
              <FormGroup label="Preset Name">
                <div className="pt-select">
                  <select onChange={this.onSelectPreset} value={currentPreset.name}>
                    <option disabled defaultValue="">Choose an preset...</option>
                    {Object.keys(defs).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </FormGroup>
              {currentPreset.params.length > 0 && (
                <FormGroup label="Preset Parameters">
                  {currentPreset.params.map((param) =>
                    <PresetParam
                      key={param.key}
                      pkey={param.key}
                      {...param}
                      onChange={this.onPresetParamChange}
                    />
                  )}
                </FormGroup>
              )}
            </div>
            <div className="pt-dialog-footer">
              <div className="pt-dialog-footer-actions">
                <Button text="Cancel" onClick={() => this.setState({ isDialogOpen: false })}/>
                <Button
                  intent={Intent.PRIMARY}
                  onClick={this.onConfirm}
                  text="OK"
                />
              </div>
            </div>
          </Dialog>
        )}
      </div>
    );
  }

}
