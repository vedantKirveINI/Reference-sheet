import { EventListner, ITinybotEventType } from "./event-listners";

export const dispatchTinyBotEvent = ({
  text,
  autoOpen,
  showDelay,
}: ITinybotEventType) => {
  const customEvent = new CustomEvent<ITinybotEventType>(
    EventListner.TINY_BOT_HANDSHAKE,
    {
      detail: {
        text: text,
        showDelay: showDelay,
        autoOpen: autoOpen,
      },
    }
  );

  window.dispatchEvent(customEvent);
};
