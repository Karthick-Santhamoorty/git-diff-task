import React, { useState, useEffect } from "react";
import { parseDiff, Diff } from "react-diff-view";
import axios from "axios";
import { SpinnerDotted } from "spinners-react";
import "react-diff-view/style/index.css";
import { NotFound, InternalError } from "./errors";
import { useParams } from "react-router-dom";

function GitDiff() {
  const [gitDiffData, setGitDiffData] = useState([]);
  const [gitCommitData, setGitCommitData] = useState({});
  const [gitDataLoaded, setGitDataLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [errorState, setErrorState] = useState("");

  const { owner, repository, commitId } = useParams();

  const getApiData = async () => {
    const [diffResponse, commitResponse] = await Promise.all([
      axios.get(
        `https://github.com/${owner}/${repository}/commit/${commitId}.diff`
      ),
      axios.get(
        `https://api.github.com/repos/${owner}/${repository}/commits/${commitId}`
      ),
    ]).catch((error) => {
      setError(true);
      if (error.response.status === 404) {
        setErrorState(404);
      } else {
        setErrorState(500);
      }
    });
    const diffArray = diffResponse.data.split(/(?=diff --git )/g);
    const diffData = [];
    commitResponse.data.files.forEach((data, index) => {
      const [respObject] = parseDiff(diffArray[index]);
      diffData.push({
        diffData: respObject,
        fileName: data.filename,
        patch: data.patch,
        changes: data.changes,
        fileToggle: "open",
        fileRawUrl: data.raw_url,
        // parseDiff: parseDiff(data.patch)
      });
    });
    setGitDiffData(diffData);
    setGitCommitData({
      author: commitResponse.data.commit.author,
      committer: commitResponse.data.commit.committer,
      commitMessage: commitResponse.data.commit.message,
      parents: commitResponse.data.parents,
      commidId: commitResponse.data.sha,
      commitDifferenceDate: Math.round((new Date().getTime() - new Date(commitResponse.data.commit.author.date).getTime()) / (1000 * 60 * 60 * 24))?? "1"
    });
    setGitDataLoaded(true);
  };
  useEffect(() => {
    getApiData();
  }, []);

  const diffFile = (hunks, diffType) => (
    <Diff viewType="unified" diffType={diffType} hunks={hunks}>
    </Diff>
  );

  const changeFileToogle = (index) => {
    setGitDiffData(
      gitDiffData.map((diffData, i) => {
        if (i === index) {
          diffData.fileToggle =
            diffData.fileToggle === "open" ? "close" : "open";
        }
        return diffData;
      })
    );
  };

  return (
    <div className="App">
      {error ? (
        errorState === 404 ? (
          <NotFound />
        ) : (
          <InternalError />
        )
      ) : (
        <div className="d-flex align-items-center justify-content-center px-lg-5 py-2">
          {gitDataLoaded ? (
            <div className="git-diff-div w-100">
              <section className="author-commit-details pb-4">
                <div className="d-flex justify-content-md-between justify-content-sm-center justify-content-center justify-content-lg-between flex-wrap flex-lg-nowrap flex-md-wrap">
                  <div className="author-details ">
                    <div className="row">
                      <div className="avatar-img-div pe-3 col-lg-2 col-sm-12 col-md-2 text-sm-center text-center">
                        <img
                          src={`https://github.com/${gitCommitData.author.name}.png`}
                          onError={(e)=>{e.target.onerror = null; e.target.src="/images/avatar.png"}}
                          alt="Avatar"
                          className="avatar-img"
                        />
                      </div>
                      <div className="header-text col-lg-10 col-sm-12 col-md-10 text-sm-center text-md-start text-center">
                        <h3 className="header">
                          {gitCommitData.commitMessage
                            ? gitCommitData.commitMessage
                            : "This is Commit Message"}
                        </h3>
                        <span className="text-color-muted">
                          Authored by
                          <span className="text-color-body">
                            {gitCommitData.author.name
                              ? " " + gitCommitData.author.name + " "
                              : "Author Name"}
                          </span>
                          {gitCommitData.commitDifferenceDate
                            ?(gitCommitData.commitDifferenceDate > 0? (gitCommitData.commitDifferenceDate > 1? `${gitCommitData.commitDifferenceDate} days ago` :"a day ago"): "today")
                            : "Commited Date"}
                        </span>
                        <p className="text-color-body">
                          {gitCommitData.commitBody && gitCommitData.commitBody}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="commit-details text-lg-end">
                    {gitCommitData.author.email !==
                      gitCommitData.committer.email && (
                      <p className="my-0 text-color-muted">
                        Commited by{" "}
                        {gitCommitData.committer.name
                          ? " " + gitCommitData.committer.name
                          : "committer name"}
                      </p>
                    )}
                    <p className="my-1 text-color-muted">
                      Commit
                      <span className="text-color-body">
                        {gitCommitData.commidId
                          ? " " + gitCommitData.commidId
                          : "commit id"}
                      </span>
                    </p>
                    {gitCommitData.parents && gitCommitData.parents[0] ? (
                      <p className="my-0 text-color-muted">
                        Parent
                        <span className="text-color-link paret-sha">
                          {" " + gitCommitData.parents[0].sha}
                        </span>
                      </p>
                    ) : (
                      <p className="my-0 text-color-muted">
                        This commit may be initial commit. so,parent SHA not
                        found
                      </p>
                    )}
                  </div>
                </div>
              </section>
              <section className="git-data">
                {gitDiffData.length > 0 &&
                  gitDiffData.map(
                    (diff, index) =>
                      diff.diffData.hunks.length > 0 && (
                        <div
                          className="accordion"
                          id="accordionPanelsStayOpenExample"
                          key={index}
                        >
                          <div className="file-diff-div pb-3">
                            <div
                              id="file-name"
                              onClick={() => changeFileToogle(index)}
                            >
                              <h2
                                className="mb-0"
                                id={"panelsStayOpen-heading-" + index}
                              >
                                <p
                                  type="button"
                                  data-toggle="collapse"
                                  data-target={
                                    "#panelsStayOpen-collapse-" + index
                                  }
                                  className="text-color-link diff-file-name"
                                >
                                  <i
                                    className={
                                      diff.fileToggle === "open"
                                        ? "fa fa-angle-down"
                                        : "fa fa-angle-right"
                                    }
                                  ></i>
                                  {diff.fileName}
                                </p>
                              </h2>
                            </div>
                            <div
                              id={"panelsStayOpen-collapse-" + index}
                              className="accordion-collapse collapse show border diff-border"
                              aria-labelledby={
                                "panelsStayOpen-heading-" + index
                              }
                            >
                              <div className="diff-changes-div p-2">
                                {diffFile(
                                  diff.diffData.hunks,
                                  diff.diffData.type,
                                  diff.diffData.content
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                  )}
              </section>
            </div>
          ) : (
            <div className="h-100 loader">
              <SpinnerDotted
                size={50}
                thickness={100}
                сolor={"#38ad48"}
                speed={100}
                still={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GitDiff;
