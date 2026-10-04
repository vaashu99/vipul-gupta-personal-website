export interface CareerRole {
  employer: string;
  role: string;
  location: string;
  period: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export const profile = {
  name: 'Vipul Gupta',
  role: 'Lead SRE Engineer',
  roleSince: 'April 2025',
  location: 'Singapore',
  summary:
    'SRE and DevOps lead with more than a decade of experience building resilient infrastructure, automating operations, and helping teams deliver dependable systems.',
  linkedin: 'https://www.linkedin.com/in/vipul-gupta-tech/',
  github: 'https://github.com/vaashu99',
  interests: ['Travel', 'Photography', 'Personal writing'],
};

export const experience: CareerRole[] = [
  {
    employer: 'GXS Bank (Grab)',
    role: profile.role,
    location: 'Singapore',
    period: `${profile.roleSince} – present`,
    start: '2025-04',
    end: 'present',
    bullets: [
      'Drive automation initiatives for infrastructure operations and application deployment, including GitOps workflows using Argo CD and Terraform.',
      'Build secure infrastructure for AI solutions and application runtimes spanning data science, MLOps, Go, and Python.',
      'Establish infrastructure governance standards with Compliance and Security teams to implement security controls and meet audit requirements.',
      'Lead migration projects, including GitLab and Jira Service Management, from strategic planning through delivery.',
      'Partner with cross-functional stakeholders to align infrastructure roadmaps with business goals and deliver complex integrations.',
    ],
  },
  {
    employer: 'GXS Bank (Grab)',
    role: 'Senior SRE Engineer',
    location: 'Singapore',
    period: 'March 2022 – March 2025',
    start: '2022-03',
    end: '2025-03',
    bullets: [
      'Designed and implemented technical architecture for critical, scalable, and highly available banking systems.',
      'Implemented Istio service mesh for secure, observable, and controlled communication between microservices.',
      'Drove cloud efficiency initiatives that reduced AWS infrastructure spend by 25% without compromising performance.',
      'Implemented cloud connectivity with vendors using an understanding of TCP, UDP, HTTP, HTTPS, and DNS.',
    ],
  },
  {
    employer: 'Xylem Inc.',
    role: 'Senior DevOps Engineer',
    location: 'Singapore',
    period: 'September 2019 – March 2022',
    start: '2019-09',
    end: '2022-03',
    bullets: [
      'Architected and deployed a runtime platform for a large-scale IoT application, supporting data ingestion and processing.',
      'Engineered hybrid infrastructure across AWS and on-premises VMware environments.',
      'Set up Prometheus and Grafana observability with dashboards for infrastructure health and application performance monitoring to help reduce recovery time.',
      'Built production clusters for Kafka, Spark, Airflow, and Redis.',
      'Created and managed virtual machines using VMware vSphere.',
      'Administered Linux environments and core services including LDAP, DNS, NTP, Rsyslog, NFS, and SFTP.',
    ],
  },
  {
    employer: 'Xylem Inc.',
    role: 'DevOps Engineer',
    location: 'Bangalore',
    period: 'March 2018 – September 2019',
    start: '2018-03',
    end: '2019-09',
    bullets: [
      'Developed reusable Terraform modules to standardize AWS provisioning across development and production environments.',
      'Automated server configuration with Ansible to reduce manual setup work.',
      'Created Jenkins jobs and maintained deployment pipelines for application releases.',
      'Set up and administered MongoDB replica sets for high availability and data redundancy.',
      'Containerized applications and their dependencies with Docker and Dockerfiles.',
    ],
  },
  {
    employer: 'Onmobile Global Limited',
    role: 'Operations Engineer',
    location: 'Bangalore',
    period: 'July 2015 – March 2018',
    start: '2015-07',
    end: '2018-03',
    bullets: [
      'Provisioned and managed AWS EC2, S3, IAM, and ELB, and automated backups with AMIs and snapshots.',
      'Administered Linux systems, including LVM disk management, kernel tuning, and access-control lists.',
      'Wrote shell scripts for reporting, user onboarding, and system maintenance.',
      'Monitored and managed Linux processes and services, and configured, upgraded, and recompiled kernels.',
      'Hardened operating systems with Iptables and Firewalld, and managed file sharing through NFS, Samba, and AutoFS.',
    ],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Cloud & containers',
    skills: ['AWS', 'Amazon EKS', 'Kubernetes', 'Docker', 'VMware'],
  },
  {
    title: 'Automation & delivery',
    skills: [
      'GitOps',
      'Terraform',
      'Argo CD',
      'Ansible',
      'Jenkins',
      'Python',
      'Shell',
    ],
  },
  {
    title: 'Systems & observability',
    skills: ['Linux', 'Networking', 'Istio', 'Prometheus', 'Grafana'],
  },
  {
    title: 'Data platforms',
    skills: [
      'MongoDB',
      'MySQL administration',
      'Kafka',
      'Spark',
      'Airflow',
      'Redis',
    ],
  },
];

export const education = [
  {
    qualification: 'Bachelor of Engineering',
    institution: 'IES, IPS Academy',
    year: '2014',
  },
  {
    qualification: 'Diploma Engineering (Electronics)',
    institution: 'S.V. Polytechnic Indore',
    year: '2010',
  },
];

export const certifications = [
  {
    title: 'Deploying and Operating AI Solutions',
    issuer: 'National University of Singapore',
    dates: 'Issued July 2026',
  },
  {
    title: 'Red Hat Certified Specialist in Containers and Kubernetes',
    issuer: 'Red Hat',
    dates: 'Issued September 2021 · Expired September 2024',
  },
];

export const highlights = [
  {
    title: 'Dependable infrastructure',
    description:
      'Designing resilient platforms for critical banking systems and diverse application runtimes.',
  },
  {
    title: 'Infrastructure for AI',
    description:
      'Building secure infrastructure for AI solutions with reliable deployment, observability, and governance.',
  },
  {
    title: 'Automation with purpose',
    description:
      'Bringing GitOps, Terraform, and automated delivery into everyday infrastructure operations.',
  },
  {
    title: '25% less AWS spend',
    description:
      'Reducing infrastructure costs without compromising performance through cloud efficiency initiatives.',
  },
];
