import mongoose, { trusted } from 'mongoose';
const { Schema } = mongoose;

const HotelSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        type:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        distance:{
            type:String,
            required:true
        },
        photos:[]
          
            
        ,
        title:{
            type:String,
            required:true
        },
        desc:{
            type:String,
            required:true
        },
        rating:{
            type:Number,
            min:0,
            max:5

        },
        rooms:{
            type:[String],
            required:true
        },
        cheapestPrice:{
            type:Number,
            required:true
        },
        featured:{
            type:Boolean,
            default:false
        }


    }

);
HotelSchema.index({city:'text',name:'text',type:'text',address:'text'});
export default mongoose.model("Hotel",HotelSchema);