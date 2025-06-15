// LEGACY FILE - This file is kept for reference during migration
// Use ../sequelize/models.ts for new Sequelize models

/*
import { Document, Schema, model } from "mongoose";

export type InboundModel = {
  id: string;
  user_id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  listen: string;
  port: number;
  protocol: string;
  settings:
    | string
    | {
        client: {
          password: string;
          email: string;
          flow: string;
          total?: number;
          totalGB?: number;
        }[];
        fallbacks: [];
      };
  stream_settings: any;
  tag: string; // uniquie
  sniffing: any;
};

export interface IV2ray extends Document {
  link: string;
  idUrl: string;
  title?: string;
  expire_date: Date;
  volume_gb: number;
  remaining_volume_mb: number;
  user_id: string[];
  order_id?: string;
  is_active: boolean;
  admin_id?: string;
  location_id?: Schema.Types.ObjectId;
  is_expired?: boolean;
  duration_days?: number;
  alarmUserIds?: string[];
  password: string;
  baseUrl: string;
  port: string;

  // user?: IUser;
  location?: any;
}

const V2raySchema = new Schema<IV2ray>(
  {
    id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    idUrl: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    expire_date: {
      type: Date,
      required: true,
    },
    volume_gb: {
      type: Number,
      required: true,
      default: 0,
    },
    remaining_volume_mb: {
      type: Number,
      required: false,
      default: 0,
    },
    user_id: {
      type: [String],
      required: true,
    },
    alarmUserIds: {
      type: [String],
      default: [],
    },
    order_id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    is_active: {
      type: Boolean,
      required: false,
      default: true,
    },
    admin_id: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    baseUrl: {
      type: String,
      required: true,
    },
    port: {
      type: String,
      required: true,
    },
    location_id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    // },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    duration_days: {
      type: Number,
      required: false,
      default: 180,
    },
  },
  { timestamps: true }
);

export const V2ray = model<IV2ray>("V2ray", V2raySchema);

export default V2ray;
*/

// MIGRATION NOTE: Use the new Sequelize models from ../sequelize/models.ts
// This file is commented out to prevent import errors during migration
