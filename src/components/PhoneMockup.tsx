type PhoneMockupProps = {
  src: string;
  alt: string;
  size?: 'card' | 'modal';
};

export default function PhoneMockup({ src, alt, size = 'card' }: PhoneMockupProps) {
  return (
    <div
      className={`relative shrink-0 rounded-[2.75rem] border-[3px] border-zinc-500 bg-zinc-950 p-[5px] shadow-[0_20px_45px_-18px_rgba(0,0,0,0.65)] ring-1 ring-zinc-900 ${
        size === 'card' ? 'w-[156px]' : 'w-[min(70vw,258px)]'
      }`}
    >
      <div className="absolute -left-[5px] top-24 h-10 w-[2px] rounded-l bg-zinc-600" aria-hidden="true" />
      <div className="absolute -right-[5px] top-28 h-14 w-[2px] rounded-r bg-zinc-600" aria-hidden="true" />
      <div className="relative aspect-[738/1600] overflow-hidden rounded-[2.15rem] bg-white">
        <img src={src} alt={alt} className="block h-full w-full object-contain" />
        <div
          className="absolute left-1/2 top-[6px] h-[14px] w-[32%] -translate-x-1/2 rounded-full bg-zinc-950 shadow-sm"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
