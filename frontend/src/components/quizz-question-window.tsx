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


interface QuizOnboardingDialogProps {
    isOpen: boolean
    onClose?: () => void
    targetRoute?: string
    targetCancel?: string
}

export function QuizOnboardingDialog({
    isOpen,
    onClose,
    targetRoute = "/quiz",
    targetCancel = "/me",
}: QuizOnboardingDialogProps) {
    const navigate = useNavigate()

    const handleStart = () => {
        onClose?.()
        navigate(targetRoute)
    }
    const handleCancel = () => {
        onClose?.()
        navigate(targetCancel)
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
                        Дякуємо, що заповнили профіль!
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                        Пропонуємо Вам також пройти психологічний тест особистості, щоб краще підібрати людей для спілкування. Це займе лише кілька хвилин.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 flex justify-end">
                    <AlertDialogAction
                        onClick={handleCancel}
                        className="w-full rounded-xl border border-border/80 bg-transparent py-2.5 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/40 hover:text-foreground active:scale-[0.98] transition-all sm:w-auto"
                    >
                        Пізніше
                    </AlertDialogAction>
                    <AlertDialogAction
                        onClick={handleStart}
                        className="w-full rounded-xl py-2.5 font-semibold sm:w-auto"
                    >
                        Пройти тест!
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}