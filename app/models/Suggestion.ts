import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISuggestion extends Document {
  suggestionText: string;
  type?: string;
  keywords?: string[];
  popularityScore?: number;
}

const SuggestionSchema = new Schema<ISuggestion>({
  suggestionText: { type: String, required: true, unique: true, index: true },
  type: { type: String },
  keywords: [{ type: String }],
  popularityScore: { type: Number, default: 0 },
});

const Suggestion: Model<ISuggestion> =
  mongoose.models.Suggestion ||
  mongoose.model<ISuggestion>('Suggestion', SuggestionSchema);

export default Suggestion;

