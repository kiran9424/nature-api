const Tour = require('../models/tours')
exports.createTour = async (req, res) => {
    try {
        const tour = await Tour.findOne({ name: req.body.name })
        if (tour) {
            return res.status(400).json({ error: 'Tour already exists' })
        }
        const newTour = await Tour.create(req.body)
        return res.status(201).json({ message: 'Tour created successfully', newTour })
    } catch (error) {
        return res.status(400).json({ error })
    }
}

exports.findTourById = async (req, res) => {
    const id = req.params.id;
    const tour = await Tour.findOne({ _id: id })
                .populate({path:'tours',select:"-__v -password"})
                .populate('reviews')
    if (!tour) {
        return res.status(400).json({ error: 'Tour does not exists' })
    }
    return res.status(201).json({ message: 'Tour fetched successfully', tour })
}

exports.findAllTour = async (req, res) => {
    const query = req.query
    let stringQuery = JSON.stringify(query)

    stringQuery = stringQuery.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    stringQuery = JSON.parse(stringQuery);

    let query1 = Tour.find(stringQuery)
    if(req.query.sort){
        query1 = query1.sort(req.query.sort)
    }
    

const tour = await query1;
    


    if (!tour) {
        return res.status(400).json({ error: 'Tour does not exists' })
    }
    return res.status(201).json({ message: `Tour fetched successfully ${tour.length}`, tour })
}

exports.getTourStats =async (req,res)=>{
    try {
        const stats = await Tour.aggregate([
            {
                $match:{ratingsAverage:{gte:4.5}}
            },
            {
                $group:{
                    //_id:{ $toUpper: '$difficulty' },
                    numTour:{$sum:1},
                    numRatings:{$sum:'$ratingsQuantity'},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'$price'}
                }
            }
        ])

        res.status(200).json({stats})
    } catch (error) {
        
    }
}

exports.findToursUsingQueryParam = async (req,res,next)=>{
    const sort = req.query.sort;
    const fields = req.query.fields.split(',').join(' ');
    const limit = +req.query.limit
   
    const tour = await Tour.find().sort(sort).select(fields).limit(limit);
    if (!tour) {
        return res.status(400).json({ error: 'Tour does not exists' })
    }
    return res.status(201).json({ message: 'Tour fetched successfully', tour })
}