import React from 'react';
import Footer from 'gatsby-theme-carbon/src/components/Footer';

const Content = ({ buildTime }) => (
  <>
    <p>
      DecisionsDev is the open source community for IBM decision automation products.
    </p>
    <p>
      Last updated: {buildTime}
    </p>
  </>
);

const links = {
  firstCol: [
    { href: 'https://github.com/DecisionsDev', linkText: 'GitHub' },
    { href: '/repositories', linkText: 'Repositories' },
    { href: 'https://www.ibm.com/decisions', linkText: 'IBM Decisions' },
    { href: 'https://github.com/DecisionsDev/decisionsdev.github.io/blob/main/TOPICS_GUIDE.md', linkText: 'Topics Guide' },
  ],
  secondCol: [
    { href: 'https://www.ibm.com/docs/en/odm', linkText: 'ODM Docs' },
    { href: 'https://www.ibm.com/docs/en/cloud-paks/cp-biz-automation', linkText: 'CP4BA Docs' },
    { href: 'https://www.ibm.com/mysupport', linkText: 'IBM Support' },
    { href: 'https://community.ibm.com/community/user/automation/communities/community-home?CommunityKey=c0005a22-520b-4181-bfad-feffd8bdc022', linkText: 'Decision Community' },
  ],
};

const CustomFooter = () => <Footer links={links} Content={Content} />;

export default CustomFooter;

// Made with Bob
