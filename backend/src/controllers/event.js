const eventModel = require("../models/event.model");
const categoryModel = require("../models/category.model");
const userModel = require("../models/user.model");
const commentModel = require("../models/comment.model");
const seatModel = require("../models/seat.model");
const { eventValidator } = require("../validations/event.js");
const dotenv = require("dotenv");
const { query } = require("express");
const { updateSeat } = require("./seat");
const cloudinary = require("cloudinary").v2;

dotenv.config();

const getList = async (req, res) => {
    try {
        const {
            _page = 1,
            _limit = 40,
            _sort = "createdAt",
            _order = "asc", // chiều tăng dần
        } = req.query;

        const options = {
            page: _page,
            limit: _limit,
            populate: "categories",
            [_sort]: _order === "desc" ? -1 : 1,
        };

        const data = await eventModel.paginate({ status: "public" }, options);
        // console.log(data);
        if (!data.docs && data.docs.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sự kiện!",
            });
        }
        return res.status(200).json({
            message: "Lấy danh sách sự kiện thành công",
            events: data,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const pageSize = req.query.pageSize || 10
        const pageIndex = req.query.pageIndex || 1
        
        const dataEvents = await eventModel.find({}).populate("categories").populate("creator").sort({createdAt: -1}).skip(pageSize * pageIndex - pageSize).limit(pageSize);

        const count = await eventModel.countDocuments();
        const totalPage = Math.ceil(count / pageSize);

        // console.log(dataEvents);

        if (!dataEvents) {
            return res.status(404).json({ message: "Events are not found" });
        }

        // console.log(dataSeats);
        // const seats = [];
        // for (i = 0; i < dataSeats.length; i++) {
        //     seats.push(String(dataSeats[i]._id));
        // }

        return res.status(200).json({
            message: "Getting All Events are successfully",
            result: {
                dataEvents,
                count,
                totalPage,
                pageSize, 
                pageIndex
            } 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message});
    }
};

const getNewEvents = async (req, res) => {
    try {
        const newEvents = await eventModel.find({ status: "public"},  "image" ).limit(4).sort({createdAt: -1});

        // console.log(123);

        if (!newEvents) {
            return res.status(404).json({ message: "New Events are not found!" });
        }

        return res.status(200).json({
            message: "Getting New Events is successfully!",
            data: newEvents,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message});
    }
};

const getEventById = async (req, res) => {
    try {
        const idEvent = req.params.id;
        const commentsData = await commentModel.find({ events: idEvent, status: "active" }).populate("customers").sort({ createdAt: "desc" });
        console.log(commentsData)

        const eventData = await eventModel.findById(idEvent).populate("categories").populate({path: "seats", select: "-events"});
        if (!eventData) {
            return res.status(404).json({ message: "Event is not found" });
        }
        eventData.comments = commentsData;

        return res.status(200).json({
            message: "Event is successfully",
            event: eventData
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createEvent = async (req, res) => {
        const data = req.body;
        const user = req.user?._id;
        // const fileImages = req.files?.map(file => file.path);
        const fileImages = data.image
     
    try {
        // console.log("this is data:",data)
        // console.log("image:", fileImages)

        const { error } = eventValidator.validate(data);
        if (error) {
            cloudinary.api.delete_resources(fileImages);
            return res.status(400).json({
                message: error.details[0].message || "Bạn vui lòng kiểm tra lại dữ liệu!",
            });
        }


        const event = await eventModel.create({
            ...data,
            creator: user,
            // image: fileImages
        });

        // console.log(event)

        if (!event) {
            cloudinary.api.delete_resources(fileImages);
            return res.status(404).json({
                message: "Bạn tạo sự kiện không thành công!",
            });
        }

        const updateCategories = await categoryModel.findByIdAndUpdate(event.categories, {
            $addToSet: {
                events: event._id,
            },
        });

        if (!updateCategories) {
            return res.status(404).json({
                message: "Thêm event cho category không thành công!",
            });
        }

        const updateUsers = await userModel.findByIdAndUpdate(event.creator, {
            $addToSet: {
                events: event._id,
            }
        });

        if (!updateUsers) {
            return res.status(404).json({
                message: "Thêm event cho user không thành công!",
            }); 
        }

        for (let i = 0; i <= event.seats.length; i++) {
            const updateSeats = await seatModel.findByIdAndUpdate(event.seats[i], {
                $addToSet: {
                    events: event._id,
                }, 
            });
        }
        
        return res.status(200).json({
            message: "Bạn đã tạo sự kiện thành công!",
            events: event,
        });


    } catch (error) {
        cloudinary.api.delete_resources(fileImages);
        return res.status(500).json({ message: error.message });
    }
};

const updateEvent = async (req, res) => {
    const data = req.body;
    const idEvent = req.params.id;
    const fileImages = req.files;
    const userLogin = req.user?._id;
    try {
        const event = await eventModel.findById(idEvent);
        const isEqualCreatorEvent = event.creator._id.equals(userLogin);

        if (isEqualCreatorEvent) {

            if (req.body) {
                const { error } = eventValidator.validate(data);
                if (error) {
                    return res.status(400).json({
                        message: error.details[0].message || "Please re-check your data!",
                    });
                }

                // console.log('data:' + data);
                const editedData = await eventModel.findByIdAndUpdate(idEvent, data, { new: true })

                if (!editedData) {
                    return res.status(404).json({
                        message: "Cập nhật Event không thành công!",
                    });
                }

                for (i = 0; i <= event.seats.length; i++) {
                const updateSeats = await seatModel.findByIdAndUpdate(event.seats[i], {
                    $addToSet: {
                        events: event._id,
                    }, 
                });
            }
                

                return res.status(200).json({
                    message: "Cập nhật Event thành công",
                    data: editedData
                });

            }
            if (req.files) {
                const editedData = await eventModel.findByIdAndUpdate(idEvent, { $push: { image: { $each: req.files.map(element => element.path) } } }, { new: true })

                if (!editedData) {
                    cloudinary.api.delete_resources(fileImages);
                    return res.status(404).json({
                        message: "Cập nhật Event không thành công!",
                    });
                }

                return res.status(200).json({
                    message: "Cập nhật Event thành công",
                    data: editedData
                });
            }
        }
        return res.status(400).json({
            message: "Bạn không có quyền cập nhật Event này!"
        })
    } catch (error) {
        cloudinary.api.delete_resources(fileImages);
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const idEvent = req.params.id;
        const userLogin = req.user?._id;
        const user = await userModel.findById(userLogin);
        const roleUserLogin = user.role;

        const event = await eventModel.findById(idEvent);
        const isEqualCreatorEvent = event.creator._id.equals(userLogin);

        if (isEqualCreatorEvent || roleUserLogin === "admin") {
            const dataEvent = await eventModel.find({ _id: idEvent, status: "Draft", orders: [] });
            if (!dataEvent) {
                return res.status(400).json({
                    message: "Bạn không thể xoá sự kiện, khi chưa hoàn tiền vé hoặc Sự kiện của bạn đang trong tình trạng publish!"
                })
            }
            const data = await eventModel.findByIdAndDelete(idEvent);
            if (!data) {
                return res.status(404).json({
                    message: "Deleting event is not successful",
                });
            }
            return res.status(200).json({
                message: "Deleting event is successful",
                data,
            });
        }
        return res.status(400).json({
            message: "Bạn không có quyền Xoá Event này!"
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getList,
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getNewEvents
}