import mongoose from 'mongoose';

const taskDependencySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    dependentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    type: { type: String, enum: ['FS', 'SS', 'FF', 'SF'], default: 'FS' }, // Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish
  },
  { timestamps: true }
);

taskDependencySchema.index({ taskId: 1, dependentTaskId: 1 }, { unique: true });

export default mongoose.model('TaskDependency', taskDependencySchema);
