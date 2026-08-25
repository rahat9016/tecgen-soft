import Image from "next/image";
import Paragraph from "../../shared/Paragraph";
import Text from "../../shared/Text";

export default function MessageFromDirector() {
  return (
    <section className="mb-12 lg:mb-20">
      <Text as="h2" className="text-3xl mb-3 lg:mb-6">
        Want to join our team?
      </Text>
      <Paragraph className="max-w-6xl mb-8 lg:mb-25">
        Support your employee&apos;s health with flexible corporate plans
        designed to improve workplace wellness and productivity. Our Corporate
        Membership options include tailored healthcare benefits that meet the
        needs of different organizations. From essential medical coverage and
        preventive checkups to family support, wellness programs, and premium
        hospital privileges, these plans ensure your workforce stays healthier,
        happier, and more engaged.
      </Paragraph>

      <Text as="h3" className="text-3xl mb-5 lg:mb-10">
        Message from Senior Director
      </Text>

      <div className="rounded-xl bg-light px-4 py-8 md:px-8 md:py-10 lg:px-16 lg:py-15 ">
        <div className="flex flex-col items-center text-center">
          <Image
            src={"/career/KaiserChowdhury.jpg"}
            alt="Kaiser Chowdhury"
            width={261}
            height={261}
            className="rounded-lg object-cover"
          />

          <h4 className="mt-6 text-xl font-semibold text-secondary-dark">
            Kaiser Chowdhury
          </h4>
          <Paragraph className="text-xs md:text-base">
            Senior Director, HR - Bangladesh
          </Paragraph>

          <div className="mt-8 space-y-4 max-w-5xl">
            <Paragraph className="text-[#555555] text-xl font-normal">
              I am pleased to welcome you to our career page.
            </Paragraph>
            <Paragraph className="text-[#555555] text-xl font-normal">
              We believe that our greatest asset is our people. Our healthcare
              professionals are committed to providing exceptional care to our
              patients and their families, and we are always looking for
              passionate individuals to join us in this mission.
            </Paragraph>
            <Paragraph className="text-[#555555] text-xl font-normal">
              Here, you will find a wealth of opportunities, time to time, in
              clinical and non-clinical domains. Whether you are a seasoned
              professional or just starting your career in healthcare, we offer
              a variety of roles across different departments, including
              clinical, nursing, operations, hospitality, finance, HR, supply
              chain, allied health, and various support services. Each position
              plays a vital role in ensuring that we deliver the highest quality
              of care to our community.
            </Paragraph>
            <Paragraph className="text-[#555555] text-xl font-normal">
              We value diversity, innovation, and collaboration, and we are
              looking for individuals who share our passion in transforming
              healthcare and making a difference in the lives of our patients
              and community.
            </Paragraph>
            <Paragraph className="text-[#555555] text-xl font-normal">
              I encourage you to explore our available positions and consider
              becoming a part of our mission to deliver outstanding care. Your
              journey towards a fulfilling career in healthcare starts here.
            </Paragraph>
          </div>
        </div>
      </div>
    </section>
  );
}
