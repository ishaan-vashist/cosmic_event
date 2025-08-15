"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface DrawerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetVariants> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, children, side = "right", open, onOpenChange, onClose, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open)
      }
    }, [open])

    const handleClose = React.useCallback(() => {
      setIsOpen(false)
      onOpenChange?.(false)
      onClose?.()
    }, [onOpenChange, onClose])

    // Handle ESC key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          handleClose()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, handleClose])

    if (!isOpen) return null

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40 bg-black/40" 
          onClick={handleClose}
          aria-hidden="true"
        />
        
        {/* Drawer */}
        <div
          ref={ref}
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
            onClick={handleClose}
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </>
    )
  }
)
Drawer.displayName = "Drawer"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-4 py-4", className)}
    {...props}
  />
))
DrawerContent.displayName = "DrawerContent"

export {
  Drawer,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
}
