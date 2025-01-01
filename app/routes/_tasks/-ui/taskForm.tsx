export const TaskForm = ({
  initial,
  handleSubmit,
}: {
  initial?: { text: string; isCompleted: boolean };
  handleSubmit?: (e: {
    id?: string;
    text: string;
    isCompleted: boolean;
  }) => void;
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        handleSubmit?.({
          isCompleted: formData.get("isCompleted") === "on",
          text: String(formData.get("text")),
        });
      }}
    >
      <div>
        <div>
          <div>
            <label htmlFor="text">Text</label>
          </div>
          <input
            required
            id="text"
            name="text"
            defaultValue={initial?.text}
            autoComplete="off"
          />
        </div>
        <div>
          <div>
            <label htmlFor="isCompleted">Is Completed</label>
          </div>
          <input
            type="checkbox"
            id="isCompleted"
            name="isCompleted"
            defaultChecked={initial?.isCompleted}
          />
        </div>
      </div>
      <button>Save</button>
    </form>
  );
};
