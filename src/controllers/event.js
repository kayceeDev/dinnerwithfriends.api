const asyncHandler = require('express-async-handler');
const { Event, Participant, ParticipantCount, User } = require('../models');
const { createEventSchema } = require('../validators');
const services = require('../services');
const { checkEventValidity } = require('../services/Event/checkEventValidity');

// Get All Events Controller
const getAllEvents = asyncHandler(async (req, res, next) => {
  Event.find({ user_id: req.user._id }, (err, data) => {
    if (err) {
      return services.createSendToken({}, 'error', err, res);
    }

    const message = 'Successfully fetched events';
    return services.newEventToken(data, 'success', message, res);
  });
});

// Get Single Event Controller
const getSingleEvent = asyncHandler(async (req, res, next) => {
  const event_id = req.params.id;
  Event.findOne(
    { _id: event_id },
    async (err, data) => {
      if (err) {
        return services.createSendToken({}, 'error', err, res);
      }

      const message = 'Successfully fetched event';
      const ckeckId = data['user_id'].toString()
      const host_info = await User.findById(ckeckId)
      const the_data = {...data['_doc'], 'host_info': {...host_info['_doc']}};
      console.log(the_data)
      return services.newEventToken(the_data, 'success', message, res);
    },
  );
});

// get all User Event

const getUserEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.find({ user_id: req.user._id });
  console.log(event);

  return res.status(200).json({
    success: true, event
  });
});

// Get Single Event By Token
const getSingleEventByToken = asyncHandler(async (req, res, next) => {
  const event_id = services.protectEvent(req.params.id);

  Event.findOne(
    { _id: event_id },
    (err, data) => {
      if (err) {
        return services.createSendToken({}, 'error', err, res);
      }

      const message = 'Successfully fetched event';
      return services.newEventToken(data, 'success', message, res);
    },
  );
});

// Delete Single Event Controller
const deleteEvent = asyncHandler(async (req, res, next) => {
  const event_id = req.params.id;
  Event.findByIdAndDelete(
    (event_id),
    (err, data) => {
      if (err) {
        return services.createSendToken({}, 'error', err, res);
      }

      const message = 'Successfully Deleted event';
      return services.newEventToken(data, 'success', message, res);
    },
  );
});

// Update Event Controller
const updateEvent = asyncHandler(async (req, res, next) => {
  const event_id = req.params.id;
  Event.find(
    { event_id, user_id: req.user._id },
    req.body,

    (err, data) => {
      if (err) {
        return services.createSendToken({}, 'error', err, res);
      }
      const message = 'Successfully Updated event';
      return services.newEventToken(data, 'success', message, res);
    },
  );
});

// Create One Controller
const addEvent = asyncHandler(async (req, res, next) => {
  const {
    end_date, start_date, event_title, event_description, location, event_type, participant_number, host_prefered_time,
  } = req.body;

  const validateUserInput = createEventSchema.validate({
    end_date, start_date, event_title, event_description, location, event_type, participant_number, host_prefered_time, user_id: req.user._id,
  });

  if (validateUserInput.error) {
    let message = '';
    if (validateUserInput.error.details[0].path[0] === 'end_date' || validateUserInput.error.details[0].path[0] === 'start_date') message = 'A date field is required';
    if (validateUserInput.error.details[0].path[0] === 'event_title') message = 'Title has to start with a letter, can contain numbers and underscores, must be at least 3 characters.';
    return services.createSendToken({}, 'error', validateUserInput.error.details[0], res);
  }

  const eventData = {
    end_date,
    host_info,
    start_date,
    event_title,
    event_description,
    location,
    event_type,
    participant_number,
    host_prefered_time,
    user_id: req.user._id,
  };
  const event = await new Event(eventData).save();
  const participantData = {
    event_id: event._id,
    email: req.user.email,
    preferred_date_time: host_prefered_time,
    fullname: req.user.name,
  };

  const participantCountData = {
    event_id: event._id,
    participant_count: 1,
  };

  await new Participant(participantData).save();
  await new ParticipantCount(participantCountData).save();
  const message = 'New Event created successfully';
  return services.newEventToken(event, 'success', message, res);
});

module.exports = {
  getAllEvents,
  addEvent,
  getSingleEvent,
  deleteEvent,
  updateEvent,
  getSingleEventByToken,
  getUserEvent,
};
