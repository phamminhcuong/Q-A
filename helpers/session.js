let db = require('../models');

module.exports = {
    createSession(req, res) {
        db.Session.create(req.body)
            .then(session => {
                res.json(session)
            })
            .catch(error => {
                res.send(error)
            })
    },
    getAllSession(req, res) {
        db.Session.find().populate('user', '-password')
            .then(sessions => {
                res.json(sessions)
            })
            .catch(error => {
                res.send(error)
            })
    },
    getSessionsByUserID(req, res) {
        db.Session.find({user: req.params.userID})
            .then(sessions => {
                res.json(sessions)
            })
            .catch(error => {
                res.send(error)
            })
    },
    getSessionByID_server(sessionID) {
        return db.Session.findById(sessionID)
            .then(session => {
                return session
            })
            .catch(error => {
                console.log(error);
            })
    },
    getSessionByID(req, res) {
        db.Session.findById(req.params.sessionID).populate('survey.data.user', 'fullName')
            .then(session => {
                res.json(session)
            })
            .catch(error => {
                res.send(error)
            })
    },
    updateSession(req, res) {
        db.Session.findByIdAndUpdate(req.params.sessionID, req.body, {new: true})
            .then(session => {
                res.json(session)
            })
            .catch(error => {
                res.send(error)
            })
    },
    updateSession_server(sessionID, data) {
        return db.Session.findByIdAndUpdate(sessionID, data, {new: true})
            .then(session => {
                return session;
            })
            .catch(error => {
                return error
            })
    },
    deleteSession(req, res) {
        db.Session.findByIdAndDelete(req.params.sessionID)
            .then(deletedSession => {
                res.json(deletedSession)
            })
            .catch(error => [
                res.send(error)
            ])
    }
};