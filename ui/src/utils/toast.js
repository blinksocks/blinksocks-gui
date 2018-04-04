import { Position, Toaster, Intent } from '@blueprintjs/core';

const MyToaster = Toaster.create({
  position: Position.TOP,
});

export default function toast(message, intent = Intent.NONE) {
  if (typeof message === 'object') {
    MyToaster.show(message);
  } else {
    MyToaster.show({ message, intent });
  }
}
