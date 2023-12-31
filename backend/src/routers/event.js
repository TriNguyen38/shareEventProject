const router = require('express').Router();
const { getList, getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getNewEvents } = require('../controllers/event.js');
const { authentication, checkPermissionAdmin, checkPermissionCreator } = require('../middlewares/authentication.js');
const uploadImage = require('../cloudinary/index.js');
const { createComment } = require('../controllers/comment.js');
const { createOrder, getAllOrders, deleteOrder } = require('../controllers/order.js');

router.get('/getList/', getList);
router.get('/newEvents/', getNewEvents);
router.get('/:id', getEventById);
router.get('/', getAllEvents);
router.post('/createEvent', checkPermissionCreator, uploadImage.array("image", 10), createEvent);
router.put('/updateEvent/:id', checkPermissionCreator, uploadImage.array("image", 10), updateEvent);
router.delete('/deleteEvent/:id',authentication, deleteEvent);

// comments
router.post('/:id/createComment', authentication, createComment);
// order
router.post('/:id/createOrder', checkPermissionCreator, createOrder);
router.get('/:id/getAllList', checkPermissionCreator, getAllOrders);

module.exports = router;