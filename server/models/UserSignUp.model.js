const mongoose =require('mongoose');
const schema=mongoose.Schema;

const  UserSignUpSchema = new schema({
    fullname :{
        type :String,
        required :true
    },
    email :{
        type :String,
        required :true,
        unique : true
    },
    password :{
        type :String,
        required :true,
        
    }
    
},{
    timestamps : true
})

const form=mongoose.model('UserSignUpData', UserSignUpSchema);
module.exports= form;