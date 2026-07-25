function TextArea({
  value,
  handleChange,
}: {
  value?: string;
  handleChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  return <textarea value={value} onChange={handleChange} />;
}

export default TextArea;
