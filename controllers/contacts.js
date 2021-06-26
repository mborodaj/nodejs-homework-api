const Contacts = require('../repositories/contacts');
const { HttpCode } = require('../helpers/constants');

const getAllContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contactsList = await Contacts.listContacts(userId, req.query);
    return res.status(HttpCode.OK).json({ status: 'success', code: HttpCode.OK, data: { contactsList } })
  } catch (e) {
    next(e);
  };
};

const getContactById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.getContactById(userId, req.params.contactId);
    if (contact) {
      return res.status(HttpCode.OK).json({ status: 'success', code: HttpCode.OK, data: { contact } })
    };
    return res.status(HttpCode.NOT_FOUND).json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' })
  } catch (e) {
    next(e)
  };
};

const addContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.addContact(userId, req.body);
    return res
      .status(HttpCode.CREATED)
      .json({ status: 'success', code: HttpCode.CREATED, data: { contact } })
  } catch (e) {
    if (e.name === 'ValidationError') {
      e.status = HttpCode.BAD_REQUEST;
    }
    next(e);
  };
};

const removeContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.removeContact(userId, req.params.contactId);
    if (contact) {
      return res.status(HttpCode.OK).json({ status: 'success', code: HttpCode.OK, data: { contact } })
    };
    return res.status(HttpCode.NOT_FOUND).json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' })
  } catch (e) {
    next(e)
  };
};

const updateContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.updateContact(userId, req.params.contactId, req.body);
    if (contact) {
      return res.status(HttpCode.OK).json({ status: 'success', code: HttpCode.OK, data: { contact } })
    };
    return res.status(HttpCode.NOT_FOUND).json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' })
  } catch (e) {
    next(e)
  };
};

const updateStatusContact = async (req, res, next) => {
  try {
    if (!req.body?.favorite) {
      return res.status(HttpCode.BAD_REQUEST).json({ status: 'error', code: HttpCode.BAD_REQUEST, message: 'missing field favorite' })
    };
    const userId = req.user.id;
    const contact = await Contacts.updateStatusContact(userId, req.params.contactId, req.body);
    if (contact) {
      return res.status(HttpCode.OK).json({ status: 'success', code: HttpCode.OK, data: { contact } })
    }
    return res.status(HttpCode.NOT_FOUND).json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' });
  } catch (e) {
    next(e);
  };
};

module.exports = {
  getAllContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};