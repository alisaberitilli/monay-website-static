export const successResponse = (req, res, data, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (req, res, message = 'Error occurred', statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null
    });
};

export default {
    successResponse,
    errorResponse
};
