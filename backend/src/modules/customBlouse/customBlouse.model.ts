import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomBlouse extends Document {
  customerId: mongoose.Types.ObjectId;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  // Step 1 – Fabric & Work
  fabric: {
    type: string;
    color: string;
    plainOrComputer: 'Plain' | 'Computer Work';
    computerWorkDesign: 'Yes' | 'No';
    workPatternType?: string;
    threadWorkColor?: string;
    borderWorkRequired: 'Yes' | 'No';
  };
  // Step 2 – Design
  design: {
    frontNeckType?: string;
    backNeckType?: string;
    sleeveType?: string;
    sleeveLength?: string;
    blouseLength?: string;
    openingType?: 'Front Open' | 'Back Open';
    closureStyle?: 'Hook' | 'Zip' | 'Dori';
    paddingRequired: 'Yes' | 'No';
    liningRequired: 'Yes' | 'No';
  };
  // Step 3 – Measurements
  measurements: {
    bust?: number;
    waist?: number;
    shoulder?: number;
    armhole?: number;
    sleeveRound?: number;
    sleeveLengthMeas?: number;
    blouseLengthMeas?: number;
    frontNeckDepth?: number;
    backNeckDepth?: number;
  };
  needsTailorSupport: boolean;
  // Step 4 – Reference Images
  referenceImages: string[]; // stored URLs
  // Step 5 – Occasion & Delivery
  occasion?: string;
  deliveryDate?: Date;
  budgetRange?: string;
  specialInstructions?: string;
  // Status & Pricing
  statusHistory: {
    status: string;
    updatedAt: Date;
    updatedBy: mongoose.Types.ObjectId;
  }[];
  price?: number;
  adminNotes?: string;
  assignedTailorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomBlouseSchema = new Schema<ICustomBlouse>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    fabric: {
      type: { type: String, required: true },
      color: { type: String, required: true },
      plainOrComputer: { type: String, enum: ['Plain', 'Computer Work'], default: 'Plain' },
      computerWorkDesign: { type: String, enum: ['Yes', 'No'], default: 'No' },
      workPatternType: { type: String },
      threadWorkColor: { type: String },
      borderWorkRequired: { type: String, enum: ['Yes', 'No'], default: 'No' },
    },
    design: {
      frontNeckType: { type: String },
      backNeckType: { type: String },
      sleeveType: { type: String },
      sleeveLength: { type: String },
      blouseLength: { type: String },
      openingType: { type: String, enum: ['Front Open', 'Back Open'] },
      closureStyle: { type: String, enum: ['Hook', 'Zip', 'Dori'] },
      paddingRequired: { type: String, enum: ['Yes', 'No'], default: 'No' },
      liningRequired: { type: String, enum: ['Yes', 'No'], default: 'No' },
    },
    measurements: {
      bust: Number,
      waist: Number,
      shoulder: Number,
      armhole: Number,
      sleeveRound: Number,
      sleeveLengthMeas: Number,
      blouseLengthMeas: Number,
      frontNeckDepth: Number,
      backNeckDepth: Number,
    },
    needsTailorSupport: { type: Boolean, default: false },
    referenceImages: [{ type: String }],
    occasion: { type: String },
    deliveryDate: { type: Date },
    budgetRange: { type: String },
    specialInstructions: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    price: { type: Number },
    adminNotes: { type: String },
    assignedTailorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const CustomBlouse = mongoose.model<ICustomBlouse>('CustomBlouse', CustomBlouseSchema);
