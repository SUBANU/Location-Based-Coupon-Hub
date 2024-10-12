    const mongoose =require('mongoose');
    const schema=mongoose.Schema;

    const  MerchentSignUpSchema = new schema({
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

    const merchentform = mongoose.model('MerchentSignUpData', MerchentSignUpSchema);
    module.exports= merchentform;