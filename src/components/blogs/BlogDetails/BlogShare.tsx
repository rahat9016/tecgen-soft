"use client";
import facebook from "@/public/icons/facebook.svg";
import linkedin from "@/public/icons/in.svg";
import ins from "@/public/icons/ins.svg";
import Whatsapp from "@/public/icons/Whatsapp.svg";
import Image from "next/image";
import {
  FacebookShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
} from "react-share";

interface Props {
  url: string;
  title: string;
}

export default function BlogShare({ url, title }: Props) {
  return (
    <div className="flex gap-1 lg:gap-3 ">
      <FacebookShareButton url={url}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
          <Image
            width={40}
            height={40}
            src={facebook}
            alt="facebook"
            className="w-3 group-hover:brightness-0 group-hover:invert duration-300"
          />
        </div>
      </FacebookShareButton>

      <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
        <Image
          width={40}
          height={40}
          src={ins}
          alt="ins"
          className="w-5 group-hover:brightness-0 group-hover:invert duration-300"
        />
      </div>

      <LinkedinShareButton url={url}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
          <Image
            width={40}
            height={40}
            src={linkedin}
            alt="linkedin"
            className="w-5 group-hover:brightness-0 group-hover:invert duration-300"
          />
        </div>
      </LinkedinShareButton>

      <WhatsappShareButton url={url} title={title}>
        <div className="flex items-center justify-center w-10 h-10 rounded-full border group hover:bg-primary">
          <Image
            width={40}
            height={40}
            src={Whatsapp}
            alt="Whatsapp"
            className="w-6 group-hover:brightness-0 group-hover:invert duration-300"
          />
        </div>
      </WhatsappShareButton>
    </div>
  );
}
