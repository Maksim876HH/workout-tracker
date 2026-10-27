
function WorkoutCard({ workout, onEdit, onDuplicate, onDelete }) {
  return (
    <li className="workout-item" data-id={workout.id}>
      <div className="workout-info">
        <strong>{workout.exercise}</strong>: {workout.weight} kg × {workout.reps} reps
      </div>
      <div className="workout-actions">
        <button
          className="edit-btn"
          title="Edit set"
          onClick={() => onEdit(workout)}
        >
          Edit
        </button>
        <button
          className="duplicate-btn"
          title="Duplicate set"
          onClick={() => onDuplicate(workout)}
        >
          +1 Set
        </button>
        <button
          className="delete-btn"
          title="Delete set"
          onClick={() => onDelete(workout.id)}
        >
          &times;
        </button>
      </div>
    </li>
  );
}

export default WorkoutCard;