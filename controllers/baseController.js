// controllers/baseController.js
class BaseController {
  constructor(model) {
    this.model = model;
  }

  // GET / - Get all
  getAll = async (req, res) => {
    try {
      let { page = 1, limit = 10 } = req.query;

      page = Number(page);
      limit = Number(limit);

      const skip = (page - 1) * limit;

      const total = await this.model.countDocuments();

      const data = await this.model
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // optional sorting

      res.json({
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  // GET /:id - Get one by ID
  getOne = async (req, res) => {
    try {
      const item = await this.model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  // POST / - Create new
  create = async (req, res) => {
    try {
      const newItem = await this.model.create(req.body);
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // PUT /:id - Update
  update = async (req, res) => {
    try {
      const updatedItem = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedItem) return res.status(404).json({ message: "Not found" });
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // DELETE /:id - Remove
  delete = async (req, res) => {
    try {
      const deletedItem = await this.model.findByIdAndDelete(req.params.id);
      if (!deletedItem) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

module.exports = BaseController;
