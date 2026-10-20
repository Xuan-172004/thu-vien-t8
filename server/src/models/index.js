const User = require('./user.model');
const Category = require('./category.model');
const Book = require('./book.model');
const BookCopy = require('./bookCopy.model');
const Warehouse = require('./warehouse.model');
const Shelf = require('./shelf.model');
const RentalOrder = require('./rentalOrder.model');
const RentalItem = require('./rentalItem.model');
const Notification = require('./notification.model');
const Otp = require('./otp.model');
const RentalPolicy = require('./rentalPolicy.model');
const DepositTransaction = require('./deposit.model');
const DigitalDocument = require('./digitalDocument.model');
const DigitalDocPurchase = require('./digitalDocPurchase.model');
const ThesisSubmission = require('./thesisSubmission.model');
const Article = require('./article.model');

// Relationships
Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Book.hasMany(BookCopy, { foreignKey: 'bookId', as: 'copies' });
BookCopy.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

Warehouse.hasMany(Shelf, { foreignKey: 'warehouseId', as: 'shelves' });
Shelf.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

Warehouse.hasMany(BookCopy, { foreignKey: 'warehouseId', as: 'copies' });
BookCopy.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

Shelf.hasMany(BookCopy, { foreignKey: 'shelfId', as: 'copies' });
BookCopy.belongsTo(Shelf, { foreignKey: 'shelfId', as: 'shelf' });

User.hasMany(RentalOrder, { foreignKey: 'userId', as: 'orders' });
RentalOrder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

RentalOrder.hasMany(RentalItem, { foreignKey: 'orderId', as: 'items' });
RentalItem.belongsTo(RentalOrder, { foreignKey: 'orderId', as: 'order' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DepositTransaction, { foreignKey: 'userId', as: 'deposits' });
DepositTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DigitalDocPurchase, { foreignKey: 'userId', as: 'digitalDocPurchases' });
DigitalDocPurchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DigitalDocPurchase.belongsTo(DigitalDocument, { foreignKey: 'digitalDocId', as: 'digitalDocument' });

User.hasMany(ThesisSubmission, { foreignKey: 'userId', as: 'thesisSubmissions' });
ThesisSubmission.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ThesisSubmission.belongsTo(DigitalDocument, { foreignKey: 'digitalDocId', as: 'digitalDocument' });

module.exports = {
    User,
    Category,
    Book,
    BookCopy,
    Warehouse,
    Shelf,
    RentalOrder,
    RentalItem,
    Notification,
    Otp,
    RentalPolicy,
    DepositTransaction,
    DigitalDocument,
    DigitalDocPurchase,
    ThesisSubmission,
    Article,
};
