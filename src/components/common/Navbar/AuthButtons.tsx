import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-6 flex-row w-full">
      {/* Login Link */}
      <Button
        variant="link"
        className="font-inter text-base font-normal leading-none tracking-[0.09em] text-[#414141] decoration-solid hover:text-primary transition-colors duration-200 text-center hover:no-underline"
      >
        Login
      </Button>

      {/* Get Started Button */}
      <Button
        type="button"
        className="items-center justify-center w-full md:w-[157px] h-[47px] bg-primary hover:bg-blue-600 text-white font-inter text-base font-bold leading-none tracking-[0.09em] rounded-[5px] transition-colors duration-200 hidden mlg:inline-flex"
      >
        Get Started
      </Button>
    </div>
  );
};

export default AuthButtons;
