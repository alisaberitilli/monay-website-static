import { Button, Container } from "#client/components/atoms";
import { TextInput } from "#client/components/form";

import Comment from "./comment/Comment";

const Comments = () => {
  return (
    <div className="w-1200px">
      <Container className="w-[1140px] p-[30px]">
        <p className="pb-[20px] text-[18px] font-[600] text-[#36597D]">
          Comments
        </p>
        <div className="flex pb-[20px]">
          <TextInput />
          <Button intent="secondary" className="ml-[20px] h-[50px] w-[73px]">
            Send
          </Button>
        </div>
        <div className="pb-[20px]">
          <Comment />
        </div>
        <div className="pb-[20px]">
          <Comment />
        </div>
      </Container>
    </div>
  );
};

export default Comments;
