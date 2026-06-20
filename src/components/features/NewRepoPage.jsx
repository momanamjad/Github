import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGitHub } from "@/contexts/GitHubContext";
import { addRepository, getStoredRepositories } from "@services/storageService.js";
import { createRepository } from "@services/GithubApi.jsx";

const ADJECTIVES = [
  "glorious", "stunning", "crisp", "super", "bug-free", "urban", "solid", "shiny", 
  "flawless", "organic", "silver", "legendary", "fuzzy", "friendly", "literate", "miniature"
];
const NOUNS = [
  "octo", "broccoli", "robot", "journey", "adventure", "engine", "system", 
  "invention", "innovation", "disco", "spoon", "waddle", "ninja", "spatula", "lamp", "umbrella"
];

const generateRandomRepoName = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}-${noun}`;
};

const NewRepoPage = () => {
  const navigate = useNavigate();
  const { refreshRepos, user } = useGitHub();
  const [formData, setFormData] = useState({
    owner: user?.login || "moman",
    repoName: "",
    description: "",
    visibility: "public",
    addReadme: false,
    gitignoreTemplate: "none",
    license: "none",
  });

  useEffect(() => {
    if (user?.login) {
      setFormData(prev => ({ ...prev, owner: user.login }));
    }
  }, [user]);

  const [suggestedRepoName] = useState(generateRandomRepoName);
  const [showGitignoreDropdown, setShowGitignoreDropdown] = useState(false);
  const [showLicenseDropdown, setShowLicenseDropdown] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const visibilityRef = useRef(null);
  const gitignoreTemplates = [
    "None",
    "Node",
    "Python",
    "Java",
    "React",
    "Vue",
    "Angular",
    "C++",
    "Go",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
  ];

  const licenses = [
    "None",
    "MIT License",
    "Apache License 2.0",
    "GNU GPLv3",
    "BSD 3-Clause",
    "BSD 2-Clause",
    "ISC License",
    "Mozilla Public License 2.0",
    "The Unlicense",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "repoName") {
      const cleanedValue = value.trim();
      if (cleanedValue) {
        const repos = getStoredRepositories();
        const exists = repos.some(r => r.name.toLowerCase() === cleanedValue.toLowerCase());
        if (exists) {
          setNameError(`The repository ${cleanedValue} already exists on this account.`);
        } else {
          setNameError("");
        }
      } else {
        setNameError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate repository name
    const cleanedName = formData.repoName.trim();
    if (!cleanedName) {
      alert("Repository name is required");
      return;
    }
    if (/\n/.test(cleanedName) || cleanedName.includes(' ')) {
      // GitHub repo names cannot contain spaces; replace them or show error
      alert("Repository name cannot contain spaces or newlines.");
      return;
    }
    const repoName = cleanedName;
    
    // Add to backend database
    try {
      await createRepository({
        name: repoName,
        description: formData.description || "",
        visibility: formData.visibility,
        language: "JavaScript",
        addReadme: formData.addReadme,
      });
      refreshRepos(); // Trigger global update
    } catch (error) {
      setNameError(error.message);
      return;
    }
    
    // Show success message
    setSuccessMessage(`✅ Repository "${formData.repoName}" created successfully!`);
    
    // Reset form
    setFormData({
      owner: user?.login || "moman",
      repoName: "",
      description: "",
      visibility: "public",
      addReadme: false,
      gitignoreTemplate: "none",
      license: "none",
    });
    
    // Redirect to repositories page after 2 seconds
    setTimeout(() => {
      navigate("/repositories");
    }, 2000);
  };

  const suggestRepoName = () => {
    const repos = getStoredRepositories();
    const exists = repos.some(r => r.name.toLowerCase() === suggestedRepoName.toLowerCase());
    if (exists) {
      setNameError(`The repository ${suggestedRepoName} already exists on this account.`);
    } else {
      setNameError("");
    }
    setFormData((prev) => ({ ...prev, repoName: suggestedRepoName }));
  };
  useEffect(() => {
    const handler = (e) => {
      if (!visibilityRef.current?.contains(e.target)) {
        setVisibilityOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div className="min-h-screen bg-[white] py-8 px-4">
      <div className="max-w-[1012px] mx-auto">
        {successMessage && (
          <div className="mb-6 sm:ml-20 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        <header className="mb-6 sm:ml-20 flex flex-col ">
          <h1 className="text-xl font-semibold text-[black] mb-2">
            Create a new repository
          </h1>
          <p className="text-[16px] text-[#59636e]">
            Repositories contain a project's files and version history. Have a
            project elsewhere?{" "}
            <a href="#" className="text-[#0969DA] hover:underline">
              Import a repository
            </a>
            .
          </p>
          <p className="text-[16px] text-[#59636e] italic">
            Required fields are marked with an asterisk (*).
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="   p-6 flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[#F6F8FA]   rounded-full flex items-center justify-center text-sm font-semibold text-[black]">
              1
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[black] mb-4">
                General
              </h2>

              <div className="flex gap-2 mb-4 flex-wrap md:flex-nowrap">
                <div className="w-full md:w-auto">
                  <label className="block text-[16px] font-semibold  mb-2">
                    Owner <span>*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#F6F8FA] border border-[#C8D1DA] hover:bg-[#E6EAEF] rounded-md px-3 py-1.5 max-w-[160px] overflow-hidden cursor-pointer">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=github"
                        alt="Owner avatar"
                        className="w-6 h-6 rounded-full border border-[#C8D1DA]"
                      />
                      <input
                        type="text"
                        value={formData.owner}
                        readOnly
                        className="bg-transparent border-none outline-none text-sm  font-semibold flex-1"
                      />
                      {/* <span className="text-[#889098]   text-xs">▼</span> */}
                    </div>
                    <span className="text-[#59636E] text-xl font-semibold hidden md:block">
                      /
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="repoName"
                    className="block text-[16px] font-semibold text-[black] mb-2"
                  >
                    Repository name <span>*</span>
                  </label>

                  <input
                    type="text"
                    id="repoName"
                    name="repoName"
                    value={formData.repoName}
                    onChange={handleInputChange}
                    className={`w-full bg-[] border ${nameError ? 'border-red-500' : '#C8D1DA'} rounded-md px-3 py-2 text-sm focus:outline-none ${nameError ? 'focus:border-red-500' : 'focus:outline-[#0969DA]'}`}
                    required
                  />
                  {nameError && (
                    <p className="mt-2 text-sm text-[#d1242f] font-medium flex items-center gap-1">
                      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="fill-current">
                        <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.03 11.315c.602 1.13-.203 2.485-1.413 2.485H1.84c-1.21 0-2.015-1.355-1.413-2.485ZM8.82 11h-1.64v1.64h1.64Zm0-6.56H7.18v4.92h1.64Z"></path>
                      </svg>
                      {nameError}
                    </p>
                  )}
                </div>
              </div>
              <div className="">
                <p className="text-[16px] text-[#59636E] m-1 ">
                  Great repository names are short and memorable. How about{" "}
                  <button
                    type="button"
                    onClick={suggestRepoName}
                    className="text-[#1F883D] hover:underline"
                  >
                    {suggestedRepoName}
                  </button>
                  ?
                </p>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-[black] mb-2"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={350}
                  className="w-full bg-[] border border-[#C8D1DA] rounded-md px-3 py-2 text-sm   focus:outline-[#0969DA] "
                ></input>
                <p className="text-xs text-[#59636E] mt-1">
                  {formData.description.length} / 350 characters
                </p>
              </div>
            </div>
          </section>

          <section className="    rounded-md p-6 flex gap-4">
            <div className="flex-shrink-0 w-8 h-8   bg-[#F6F8FA] rounded-full flex items-center justify-center text-sm font-semibold text-[black]">
              2
            </div>

            <div className="flex-1 ">
              <h2 className="text-xl font-semibold text-[black] mb-4">
                Configuration
              </h2>

              <div className="mb-6">
                <div className="flex justify-between border border-gray-300 rounded-md p-4 bg-white">
                  <div>
                    <label className="text-[16px] font-semibold">
                      Choose visibility <span>*</span>
                    </label>
                    <p className="text-[14px] text-[#59636E] mt-1">
                      Choose who can see and commit to this repository
                    </p>
                  </div>

                  <div className="relative " ref={visibilityRef}>
                    <button
                      type="button"
                      onClick={() => setVisibilityOpen(!visibilityOpen)}
                      className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm bg-white hover:bg-gray-200 shadow-2xl m-1"
                    >
                      {formData.visibility === "public"
                        ? " Public"
                        : " Private"}
                      <span>▾</span>
                    </button>

                    {visibilityOpen && (
                      <div className="absolute right-0 mt-2 w-[320px] bg-white border rounded-md shadow-lg z-50 p-2">
                        <button
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              visibility: "public",
                            }));
                            setVisibilityOpen(false);
                          }}
                          className={`w-full text-left p-3 hover:bg-gray-100 rounded-md ${
                            formData.visibility === "public"
                              ? ""
                              : ""
                          }`} 
                        >
                          <div className="font-medium text-sm">Public</div>
                          <p className="text-xs text-gray-600 mt-1">
                            Anyone on the internet can see this repository. You
                            choose who can commit.
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              visibility: "private",
                            }));
                            setVisibilityOpen(false);
                          }}
                          className={`w-full text-left p-3 hover:bg-gray-100 rounded-md ${
                            formData.visibility === "private"
                              ? "bg-gray-100"
                              : ""
                          }`}
                        >
                          <div className="font-medium text-sm">Private</div>
                          <p className="text-xs text-gray-600 mt-1">
                            You choose who can see and commit to this
                            repository.
                          </p>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className=" border border-[#C8D1DA]  rounded-md p-4">
                <div className="flex justify-between items-start mb-5 border-b border-[#C8D1DA]    p-3">
                  <div className="flex-1">
                    <strong className="block text-[16px] font-semibold text-[black] mb-1">
                      Add README
                    </strong>
                    <p className="text-xs text-[#8b949e]">
                      READMEs can be used as longer descriptions.{" "}
                      <a
                        href="#"
                        className="text-[black] hover:text-[#58a6ff] hover:underline"
                      >
                        About READMEs
                      </a>
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="addReadme"
                      checked={formData.addReadme}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="relative w-10 h-5 bg-[] rounded-full peer peer-checked:bg-[#238636] transition-colors">
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[#c9d1d9] rounded-full transition-transform ${
                          formData.addReadme ? "translate-x-5" : ""
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-[#8b949e]">
                      {formData.addReadme ? "On" : "Off"}
                    </span>
                  </label>
                </div>

                <div className="flex justify-between items-start mb-5 border-b border-[#C8D1DA]    p-3">
                  <div className="flex-1">
                    <strong className="block text-[16px] font-semibold text-[black] mb-1">
                      Add .gitignore
                    </strong>
                    <p className="text-[14px] text-[#8b949e]">
                      .gitignore tells git which files not to track.{" "}
                      <a
                        href="#"
                        className="text-[black] hover:text-[#58a6ff] hover:underline"
                      >
                        About ignoring files
                      </a>
                    </p>
                  </div>
                  <div className="relative  flex items-end  ">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGitignoreDropdown(!showGitignoreDropdown);
                        setShowLicenseDropdown(false);
                      }}
                      className="w-auto flex items-center  gap-4 bg-[#EFF2F5] border border-[#C8D1DA] rounded-md font-semibold px-3 py-1.5 text-sm text-[black] cursor-pointer hover:bg-[#E6EAEF] transition-colors"
                    >
                      <span>
                        {formData.gitignoreTemplate === "none"
                          ? "No .gitignore"
                          : formData.gitignoreTemplate}
                      </span>
                      <span className="text-xs text-[#8b949e]">▼</span>
                    </button>
                    {showGitignoreDropdown && (
                      <div className="absolute bottom-full left-0 right-0 mt-1 bg-[white] rounded-md shadow-lg max-h-[400px] w-[320px] overflow-y-auto z-100 p-4 shadow-2xl border border-[#C8D1DA]">
                        <span className="text-[black] text-[16px] font-semibold  ">
                          Choose a gitignore template
                        </span>
                        <hr className="mt-2 mb-2 border-t border-[#C8D1DA]" />
                        <div className="  p-1  ">
                          {gitignoreTemplates.map((template) => (
                            <button
                              key={template}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  gitignoreTemplate: template.toLowerCase(),
                                }));
                                setShowGitignoreDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-[black] hover:bg-[#E6EAEF] rounded-md transition-colors"
                            >
                              {template === "None" ? "No .gitignore" : template}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start rounded-md p-3">
                  <div className="flex-1">
                    <strong className="block text-[16px] font-semibold text-[black] mb-1">
                      Add license
                    </strong>
                    <p className="text-[14px] text-[#8b949e]">
                      Licenses explain how others can use your code.{" "}
                      <a
                        href="#"
                        className="text-[black] hover:text-[#58a6ff] hover:underline"
                      >
                        About licenses
                      </a>
                    </p>
                  </div>
                  <div className="relative w-auto   ">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLicenseDropdown(!showLicenseDropdown);
                        setShowGitignoreDropdown(false);
                      }}
                      className="w-full flex items-center gap-4 w-auto bg-[#EFF2F5] border border-[#C8D1DA] font-semibold rounded-md px-3 py-1.5 text-sm text-[black] hover:bg-[#E6EAEF] transition-colors"
                    >
                      <span>
                        {formData.license === "none"
                          ? "No license"
                          : formData.license}
                      </span>
                      <span className="text-xs text-[#8b949e]">▼</span>
                    </button>
                    {showLicenseDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 w-[320px] p-4  bg-[white] border border-[#C8D1DA] rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
                        <span className="text-[black] font-semibold text-[16px] m-2">
                          Choose a Licence
                        </span>
                        <hr className="my-2 border-t border-[#C8D1DA]" />
                        <div className="">
                          {licenses.map((license) => (
                            <button
                              key={license}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  license: license.toLowerCase(),
                                }));
                                setShowLicenseDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-[black] hover:bg-[#E6EAEF] rounded-md transition-colors"
                            >
                              {license === "None" ? "No license" : license}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

             
           <div className="flex justify-end ">
              <button
              type="submit"
              disabled={!formData.repoName.trim() || !!nameError}
              className="bg-[#238636] hover:bg-[#2ea043]  text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors disabled:bg-[#94d3a2] disabled:text-white disabled:cursor-not-allowed"
            >
              Create repository
            </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default NewRepoPage;
