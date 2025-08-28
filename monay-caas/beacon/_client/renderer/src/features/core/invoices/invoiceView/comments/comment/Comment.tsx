const Comment = () => {
  return (
    <div className="flex w-[1140px]">
      <div className="flex h-[40px] items-center rounded-[50%] bg-[#BBF7D0] p-[10px]">
        <p className="text-[18px] font-[300] text-[#36597D]">AB</p>
      </div>
      <div className="pl-[15px]">
        <div className="flex">
          <p className="text-[16px] font-[600] text-[#36597D]">Ibarhim Ali</p>
          <p className="pl-[5px] text-[16px] font-[400] text-[#8B9EB0]">
            1h ago
          </p>
        </div>
        <p className="w-[1076px] pt-[10px] text-[14px] font-[400] text-[#36597D]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p className="pt-[10px] text-[14px] font-[600] text-[#564DCD]">Reply</p>
      </div>
    </div>
  );
};

export default Comment;
