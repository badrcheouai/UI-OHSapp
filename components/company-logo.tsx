import Image from "next/image"

interface CompanyLogoProps {
  className?: string
  size?: number
}

export function CompanyLogo({ className = "", size = 40 }: CompanyLogoProps) {
  return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Image
            src="/images/Logo-ohse.png"
            alt="OSHapp Logo"
            width={size}
            height={size}
            className="drop-shadow-sm hover:drop-shadow-md transition-all duration-300"
            style={{ width: "auto", height: "auto" }}
            priority
        />
      </div>
  )
}
