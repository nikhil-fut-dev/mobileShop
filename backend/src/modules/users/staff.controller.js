import staffService from "./services/staff.service.js";

class StaffController {
  createStaff = async (req, res) => {
    const staff = await staffService.createStaff(req.body, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: { staff },
    });
  };

  getStaff = async (req, res) => {
    const result = await staffService.getStaff(req.query);

    return res.status(200).json({
      success: true,
      message: "Staff members fetched successfully",
      data: result,
    });
  };

  getStaffById = async (req, res) => {
    const staff = await staffService.getStaffById(req.params.userId);

    return res.status(200).json({
      success: true,
      message: "Staff member fetched successfully",
      data: { staff },
    });
  };

  updateStaff = async (req, res) => {
    const staff = await staffService.updateStaff(req.params.userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      data: { staff },
    });
  };

  updateStaffStatus = async (req, res) => {
    const staff = await staffService.updateStaffStatus(
      req.params.userId,
      req.body.status,
    );

    return res.status(200).json({
      success: true,
      message: "Staff account status updated successfully",
      data: { staff },
    });
  };
}

export default new StaffController();
