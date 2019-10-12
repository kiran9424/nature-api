const Review = require('../models/review')

exports.createReview = async (req,res,next)=>{
    try {
        if(!req.body.reviewTours){
            req.body.reviewTours = req.params.tourId;
        }
        if(!req.body.reviewUser){
            req.body.reviewUser = req.user.id;
        }
        const review = await Review.create(req.body);
        res.status(201).json({status:'success',review})
    } catch (error) {
        return res.status(400).json({status:'fail',error})
    }

}

exports.getAllReviews = async (req,res,next)=>{
    try {
        const reviews = await Review.find()
                        .populate({path:'reviewTours',select:'-__v'})
                        .populate({path:'reviewUser',select:'-__v'})
        if(!reviews){
            return res.status(400).json({status:'fail',message:'reviews not found'})
        }
        res.status(201).json({status:'success',reviews})
        
    } catch (error) {
        return res.status(400).json({status:'fail',error})
    }
}