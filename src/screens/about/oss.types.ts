export interface PackageDetail {
  name: string;
  size: number;
  license: string | undefined;
  repo: License['repository'];
}

export interface License {
  libraryName: string;
  _license: string;
  _licenseContent: string;
  _description: string;
  author: {name: string; email: string};
  repository: {type: string; url: string} | undefined;
}
