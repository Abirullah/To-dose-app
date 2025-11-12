import express from "express";
import UserWorksModel from "../Modells/UserWorksModel.js";

const AddTask = async (req, res) => {
  try {
    const { workTitle, workDescription, worksComletionTime } = req.body;

    if (!workTitle || !workDescription || !worksComletionTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newTask = new UserWorksModel({
      workTitle,
      workDescription,
      worksComletionTime,
      userId: req.params.userId,
    });
    await newTask.save();

    res.status(201).json({ message: "Task added successfully" });
  } catch (error) {
    res.status(500).json( { cause: error.message });
  }
};





export default { AddTask };
