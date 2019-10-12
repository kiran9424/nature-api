const User = require('../models/user');

const filteredObj = (obj, ...values)=>{
    let newObject = {};
    Object.keys(obj).forEach(el=>{
        if(values.includes(el))
            newObject[el] = obj[el]
    });

    return newObject;
}

exports.getAllUsers = async (req,res,next)=>{
    const user = await User.find().select('-password -confirmPassword');
    // if(!user){
    //     return res.status(400).json({status:"fail",message:"users not found."})
    // }

    res.status(200).json({status:"success",user});
}

exports.updateUser = async (req,res,next)=>{
    if(req.body.password||req.body.confirmPassword){
        return res.status(400).json({status:"fail",message:"cant able to update password here"})
    }

    //allow users only to update name and email
    const filteredFields = filteredObj(req.body,'name','email');
    const updateUser = await User.findByIdAndUpdate(req.user.id,filteredFields,{new:true,runValidators:true}).select('-password');
    res.status(200).json({
        status:"success",
        data:{
            user:updateUser
        }
    })
}

exports.deleteUser = async (req,res,next)=>{
    const user  =await User.findByIdAndUpdate(req.user.id,{active:false});
    if(!user){
        return res.status(400).json({status:"fail",message:"user not found."})
    }

    res.status(200).json({status:"success",message:"user deleted successfully...."});
}

exports.getLoggedInUserDetails = async (req,res,next)=>{

    req.params.id;
    id = req.user.id
    if(!id || (id !== req.user.id)){
        return res.status(400).json({status:"fail",message:"user not found."}) 
    }
    const user = await User.findOne({_id:id}).select('-password -__v');
    if(!user){
        return res.status(400).json({status:"fail",message:"user not found."})
    }

    res.status(200).json({status:"success",user});

}