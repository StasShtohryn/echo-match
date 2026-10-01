import { LoginForm } from "@/components/login-form"
import logo from "@/media/logo.svg"
import animationVideo from "../media/animation.mp4";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-3">
      <div className="w-full h-full overflow-hidden flex items-center justify-center">
        <video
          src={animationVideo}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          className="w-full h-full object-cover -scale-x-100"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center">
          <img
            src={logo}
            alt="EchoMatch Logo"
            className="h-13 w-auto object-contain"
          />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="">
        <video
          src={animationVideo}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}