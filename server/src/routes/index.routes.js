const userRoutes = require('./users.routes');
const bookRoutes = require('./books.routes');
const rentalRoutes = require('./rentals.routes');
const cardRoutes = require('./cards.routes');
const copyRoutes = require('./copies.routes');
const policyRoutes = require('./rentalPolicies.routes');
const paymentRoutes = require('./payment.routes');
const digitalDocRoutes = require('./digitalDocument.routes');
const thesisSubmissionRoutes = require('./thesisSubmission.routes');
const notificationRoutes = require('./notification.routes');
const emailRoutes = require('./email.routes');
const articleRoutes = require('./article.routes');
const dashboardRoutes = require('./dashboard.routes');

function routes(app) {
    app.use('/api/users', userRoutes);
    app.use('/api/books', bookRoutes);
    app.use('/api/rentals', rentalRoutes);
    app.use('/api/cards', cardRoutes);
    app.use('/api/copies', copyRoutes);
    app.use('/api/policies', policyRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/digital-docs', digitalDocRoutes);
    app.use('/api/thesis-submissions', thesisSubmissionRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/emails', emailRoutes);
    app.use('/api/articles', articleRoutes);
    app.use('/api/dashboard', dashboardRoutes);
}

module.exports = routes;
