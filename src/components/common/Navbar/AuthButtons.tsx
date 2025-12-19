import { Button } from "@/components/ui/button";

const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
  return (
    <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-6'} flex-row`}>
      {/* Login Link */}
      <Button
        variant="link"
        className={`font-inter text-sm sm:text-base font-normal leading-none tracking-[0.09em] text-[#414141] decoration-solid hover:text-primary transition-colors duration-200 text-center hover:no-underline p-0 h-auto ${isMobile ? 'px-2' : ''}`}
      >
        Login
      </Button>

      {/* Get Started Button - Hidden on mobile, shown on larger screens */}
      {!isMobile && (
        <Button
          type="button"
          className="items-center justify-center w-[157px] h-[47px] bg-primary hover:bg-blue-600 text-white font-inter text-base font-bold leading-none tracking-[0.09em] rounded-[5px] transition-colors duration-200 hidden md:inline-flex"
        >
          Get Started
        </Button>
      )}
    </div>
  );
};

export default AuthButtons;
