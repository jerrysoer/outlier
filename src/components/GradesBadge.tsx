"use client";

import type { ChannelGrade } from "@/lib/types";

interface Props {
  grades: { channelA: ChannelGrade; channelB: ChannelGrade };
  channelAName: string;
  channelBName: string;
}

function gradeColor(letter: string): string {
  switch (letter) {
    case "A": return "var(--positive)";
    case "B": return "#4B8BF5";
    case "C": return "var(--caution)";
    case "D": return "var(--warning)";
    case "F": return "var(--negative)";
    default: return "var(--text-muted)";
  }
}

function GradeLetter({ grade, name }: { grade: ChannelGrade; name: string }) {
  const color = gradeColor(grade.letter);

  return (
    <div className="card p-5 flex-1 text-center">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-3">
        {name}
      </div>
      <div
        className="text-6xl font-bold font-mono mb-3 leading-none"
        style={{ color }}
      >
        {grade.letter}
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        {grade.rationale}
      </p>
    </div>
  );
}

export default function GradesBadge({ grades, channelAName, channelBName }: Props) {
  return (
    <div className="animate-fade-in-up" style={{ opacity: 0 }}>
      <div className="label-mono mb-3">Channel Grades</div>
      <div className="grid grid-cols-2 gap-3">
        <GradeLetter grade={grades.channelA} name={channelAName} />
        <GradeLetter grade={grades.channelB} name={channelBName} />
      </div>
    </div>
  );
}
