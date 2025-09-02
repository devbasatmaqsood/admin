const fs = require("fs");
const path = require("path");
const ContentPage = require("../../models/contentPage.model");

const { deleteFile } = require("../../middleware/deleteFile");

const getImageUrl = (file) => {
  return file ? process.env.baseURL + file.path.replace(/\\/g, "/") : "";
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { title, description, name } = req.body;

    if (!name || !title || !description) {
      if (req.file) deleteFile(req.file);
      return res.status(400).json({
        status: false,
        message: "name, title, description, are required.",
      });
    }

    const nameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!nameRegex.test(name)) {
      if (req.file) deleteFile(req.file);
      return res.status(400).json({
        status: false,
        message: "The 'name' field must not contain spaces or special characters.",
      });
    }

    const existingContentPage = await ContentPage.findOne({ name });
    if (existingContentPage) {
      if (req.file) deleteFile(req.file);
      return res.status(400).json({
        status: false,
        message: "Content Page with the same name already exists.",
      });
    }

    const iconUrl = req.file ? process.env.baseURL + req.file.path.replace(/\\/g, "/") : "";

    const contentPage = new ContentPage({
      name,
      icon: iconUrl,
      title: title,
      description: description,
    });

    await contentPage.save();

    return res.status(200).json({
      status: true,
      message: "ContentPage created successfully.",
      data: contentPage,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const contentPages = await ContentPage.find().sort({ created: -1 }).lean();
    return res.status(200).json({ status: true, data: contentPages });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET BY NAME
exports.getByName = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
      return res.status(400).json({
        status: false,
        message: "Invalid name parameter.",
      });
    }

    const contentPage = await ContentPage.findOne({ name });
    if (!contentPage) {
      return res.status(404).json({ status: false, message: "ContentPage not found." });
    }

    return res.status(200).json({ status: true, data: contentPage });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.edit = async (req, res) => {
  try {
    const { contentId } = req.query;
    const { title, description } = req.body;

    if (!contentId) {
      if (req.file) deleteFile(req.file);
      return res.status(400).json({
        status: false,
        message: "Content Id is required.",
      });
    }

    const contentPage = await ContentPage.findById(contentId);
    if (!contentPage) {
      if (req.file) deleteFile(req.file);
      return res.status(404).json({ status: false, message: "ContentPage not found." });
    }

    // Update localized fields
    if (title) contentPage.title = title;
    if (description) contentPage.description = description;

    // Update icon if new one uploaded
    if (req.file) {
      const oldIcon = contentPage.icon?.split("storage")[1];
      if (oldIcon && oldIcon !== "/noImage.png") {
        const fs = require("fs");
        const path = require("path");
        const fullPath = path.join("storage", oldIcon);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
      contentPage.icon = process.env.baseURL + req.file.path;
    }

    await contentPage.save();

    return res.status(200).json({
      status: true,
      message: "Content Page updated successfully.",
      data: contentPage,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const { contentId } = req.query;
    const contentPage = await ContentPage.findByIdAndDelete(contentId);

    if (!contentPage) {
      return res.status(404).json({ status: false, message: "ContentPage not found." });
    }

    const iconPath = contentPage.icon?.split("storage")[1];
    if (iconPath && iconPath !== "/noImage.png") {
      const fullPath = path.join("storage", iconPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    return res.status(200).json({
      status: true,
      message: "ContentPage deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
