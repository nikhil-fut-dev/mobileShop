import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  updateBranchStatus,
} from "./services/branch.service.js";

import { HTTP_STATUS } from "../../shared/constants/httpStatus.js";

class BranchController {
  async createBranch(req, res) {
    const branch = await createBranch(req.body, req.user._id);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Branch created successfully",
      data: { branch },
    });
  }

  async getBranches( res) {

    const result = await getBranches({
      page,
      limit,
      status,
      search,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branches fetched successfully",
      data: result,
    });
  }

  async getBranchById(req, res) {
    const branch = await getBranchById(req.params.branchId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branch fetched successfully",
      data: { branch },
    });
  }

  async updateBranch(req, res) {
    const branch = await updateBranch(req.params.branchId, req.body);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branch updated successfully",
      data: { branch },
    });
  }

  async updateBranchStatus(req, res) {
    const branch = await updateBranchStatus(
      req.params.branchId,
      req.body.status,
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Branch status updated successfully",
      data: { branch },
    });
  }
}

export default new BranchController();
