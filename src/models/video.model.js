import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoModel = new Schema(
    {
        videoFile: {
            type: String,
            required: true,

        },
        thumbNail: {
            type: String,
        },
        title: {
            type: String,
            required: true
        },
        description:
        {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: ture
        },
        owner: {
            type: Schema.Types.ObjectId
        }



    },
    {
        timestamps: true
    }
)
videoModel.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoModel);