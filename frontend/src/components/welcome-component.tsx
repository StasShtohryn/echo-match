import { useNavigate } from "react-router"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import logo from "@/media/logo.svg"



interface WelcomeOnboardingDialogProps {
    isOpen: boolean
    onClose?: () => void
    targetRoute?: string
}

export function WelcomeOnboardingDialog({
    isOpen,
    onClose,
    targetRoute = "/tests",
}: WelcomeOnboardingDialogProps) {
    const navigate = useNavigate()

    const handleStart = () => {
        onClose?.()
        navigate(targetRoute)
    }

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="flex flex-col items-center space-y-0 text-center max-w-md rounded-2xl p-6">
                <AlertDialogHeader className="flex flex-col items-center space-y-0 text-center sm:text-center">
                    <div className="mb-2 flex w-full items-center justify-center">
                        <img
                            src={logo}
                            alt="EchoMatch Logo"
                            className="h-9 w-auto object-contain"
                        />
                    </div>

                    <AlertDialogTitle className="text-xl font-bold tracking-tight">
                        Вітаємо у EchoMatch!
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                        Будь ласка, заповніть ваш профіль усією цікавою про Вас інформацією. Так Ви допоможете іншим підібрати цікаві Вам теми для розмови!
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-4 flex justify-center items-center">
                    <AlertDialogAction
                        onClick={handleStart}
                        className="w-full rounded-xl py-2.5 font-semibold sm:w-auto"
                    >
                        Почати розповідати про себе
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}