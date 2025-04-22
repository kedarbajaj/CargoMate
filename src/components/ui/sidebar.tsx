
import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{ collapsed: boolean; setCollapsed: React.Dispatch<React.SetStateAction<boolean>> } | undefined>(undefined)

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  return <SidebarContext.Provider value={{ collapsed, setCollapsed }}>{children}</SidebarContext.Provider>
}

function useSidebarContext() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}

function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebarContext()
  return (
    <div
      data-collapsed={collapsed}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar transition-width duration-300",
        collapsed ? "w-16" : "w-64", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-14 items-center border-b px-4", className)} {...props}>
    {children}
  </div>
}

function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props}>
    {children}
  </div>
}

function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center border-t p-4", className)} {...props}>
    {children}
  </div>
}

function SidebarGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-2", className)} {...props}>
    {children}
  </div>
}

function SidebarGroupLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebarContext()
  if (collapsed) return null
  return <div className={cn("mb-2 px-2 text-xs font-semibold text-sidebar-foreground/60", className)} {...props}>
    {children}
  </div>
}

function SidebarGroupContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props}>
    {children}
  </div>
}

function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />
}

function SidebarMenuButton({
  className,
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { collapsed } = useSidebarContext()
  
  if (asChild) {
    const Child = React.Children.only(children) as React.ReactElement
    return React.cloneElement(Child, {
      className: cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed ? "justify-center" : "",
        Child.props.className,
        className
      ),
      ...props
    })
  }
  
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", 
        collapsed ? "justify-center" : "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { collapsed, setCollapsed } = useSidebarContext()
  return (
    <button 
      className={cn("flex h-10 w-10 items-center justify-center rounded-md text-sidebar-foreground", className)}
      onClick={() => setCollapsed(prev => !prev)}
      {...props}
    >
      {collapsed ? (
        <ChevronRightIcon className="h-5 w-5" />
      ) : (
        <ChevronLeftIcon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebarContext,
}
