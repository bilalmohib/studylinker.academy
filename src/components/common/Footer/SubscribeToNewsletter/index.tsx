import LazyIframe from "@/components/common/LazyIframe";
import { Heading1, Paragraph } from "@/components/common/Typography";
import GeometricPattern from "@/components/common/Footer/SubscribeToNewsletter/GeometricPattern";

const SubscribeToNewsletter = () => {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-l from-cyan-700 to-cyan-600 rounded-[10px] py-8 px-4 sm:py-12 sm:px-6 lg:py-20 lg:px-10 overflow-hidden gap-6 lg:gap-0">
      {/* Custom geometric pattern background */}
      <GeometricPattern opacity={0.15} />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col justify-center items-center lg:items-start gap-4 text-center lg:text-left">
        <Heading1 className="leading-tight sm:leading-16.5 text-white">
          Subscribe <br className="hidden sm:block" /> to our newsletter
        </Heading1>
        <Paragraph className="text-white max-w-md lg:max-w-none">
          Subscribe to our newsletter to get the latest news and updates.
        </Paragraph>
      </div>
      <div className="relative z-10 flex flex-col justify-center items-center">
        <div className="w-full max-w-[575px] h-fit rounded-[5px] overflow-hidden">
          <LazyIframe
            src="https://api.appointmenteer.com/widget/form/gT17pyyPh0tBQT0JZeBv"
            title="SmartlyQ Newsletter v3"
            scriptSrc="https://api.appointmenteer.com/js/form_embed.js"
            scriptStrategy="lazyOnload"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "0px",
            }}
            id="inline-gT17pyyPh0tBQT0JZeBv"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="SmartlyQ Newsletter v3"
            data-height="150"
            data-layout-iframe-id="inline-gT17pyyPh0tBQT0JZeBv"
            data-form-id="gT17pyyPh0tBQT0JZeBv"
          />
        </div>
      </div>
    </div>
  );
};
export default SubscribeToNewsletter;
