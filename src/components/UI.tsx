import React from "react";

export function PageHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="page-title">{title}</h1>
      {actions}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "p-4 border-b" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "p-4" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function Chip({ children, color = "" }: { children: React.ReactNode; color?: "accent" | "success" | "" }) {
  const cls = color === "accent" ? "chip chip-accent" : color === "success" ? "chip chip-success" : "chip";
  return <span className={cls}>{children}</span>;
}

export function Divider() {
  return <div className="h-px" style={{ background: "var(--border)" }} />;
}
