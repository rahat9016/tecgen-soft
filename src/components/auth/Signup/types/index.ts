import { ErrorType } from "@/src/types/common/common";
import { SignupFormType } from "../Schema";

export interface SignupFormProps {
  onSubmit: (data: SignupFormType) => void;
  error?: ErrorType | null;
  isPending?: boolean;
}
