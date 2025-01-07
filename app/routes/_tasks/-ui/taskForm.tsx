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
          <label className="floating-label">
            <span>Text</span>
            <input
              placeholder="Text"
              className="input input-md"
              required
              name="text"
              defaultValue={initial?.text}
              autoComplete="off"
            />
          </label>
        </div>
        <div>
          <div>
            <label htmlFor="isCompleted">Is Completed 123</label>
          </div>
          <input
            className="toggle toggle-success"
            type="checkbox"
            id="isCompleted"
            name="isCompleted"
            defaultChecked={initial?.isCompleted}
          />
        </div>
      </div>
      <button className="btn btn-primary">Save</button>
    </form>
  );
};
