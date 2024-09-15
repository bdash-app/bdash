import React from "react";

type Props = {
  readonly title: string;
  readonly onChangeTitle: (title: string) => void;
};

const QueryHeaderTitle: React.FC<Props> = ({ title, onChangeTitle }) => {
  const handleTextareaHeight = (element: HTMLTextAreaElement): void => {
    element.style.height = "";
    element.style.height = element.scrollHeight + "px";
  };

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
    e.target.style.height = "";
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    onChangeTitle(e.target.value);
    handleTextareaHeight(e.target);
  };

  return (
    <div className="QueryHeaderTitle">
      <textarea
        className="QueryHeaderTitle-textarea"
        value={title}
        onFocus={(e) => handleTextareaHeight(e.target)}
        onChange={handleChangeTitle}
        onBlur={handleTextareaBlur}
        rows={1}
      />
    </div>
  );
};

export default QueryHeaderTitle;
